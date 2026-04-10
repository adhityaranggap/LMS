import Docker from 'dockerode';
import { Duplex } from 'stream';
import { logger } from './logger';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export interface ContainerInfo {
  id: string;
  name: string;
  state: string;
  status: string;
  ip?: string;
}

export class DockerService {
  async createNetwork(name: string, subnet: string): Promise<string> {
    const network = await docker.createNetwork({
      Name: name,
      Driver: 'bridge',
      Internal: true, // No external access
      IPAM: {
        Config: [{ Subnet: subnet, Gateway: subnet.replace('.0/24', '.1') }],
      },
      Labels: { 'biulms': 'lab' },
    });
    logger.info('Docker network created', { tag: 'docker', name, subnet, id: network.id });
    return network.id;
  }

  async removeNetwork(id: string): Promise<void> {
    try {
      const network = docker.getNetwork(id);
      await network.remove();
      logger.info('Docker network removed', { tag: 'docker', id });
    } catch (err: any) {
      if (err.statusCode !== 404) {
        logger.error('Failed to remove network', { tag: 'docker', id, error: String(err) });
        throw err;
      }
    }
  }

  async createContainer(
    image: string,
    name: string,
    networkId: string,
    ip: string,
    env: Record<string, string>,
    memoryMb: number,
    caps: string[] = ['NET_RAW']
  ): Promise<string> {
    const envArray = Object.entries(env).map(([k, v]) => `${k}=${v}`);

    const container = await docker.createContainer({
      Image: image,
      name,
      Env: envArray,
      Hostname: name.includes('atk') ? 'attacker' : 'target',
      HostConfig: {
        Memory: memoryMb * 1024 * 1024,
        MemorySwap: memoryMb * 1024 * 1024, // No swap
        CpuShares: 256,
        NetworkMode: networkId,
        CapDrop: ['ALL'],
        CapAdd: caps,
        SecurityOpt: ['no-new-privileges:true'],
        PidsLimit: 256,
        // Limit writable storage to RAM-backed tmpfs — prevents disk exhaustion
        Tmpfs: {
          '/tmp': 'rw,noexec,nosuid,size=50m',
          '/home/student': 'rw,nosuid,size=100m',
        },
      },
      NetworkingConfig: {
        EndpointsConfig: {
          [networkId]: {
            IPAMConfig: { IPv4Address: ip },
          },
        },
      },
      Labels: { 'biulms': 'lab', 'biulms-container': name },
      Tty: true,
      OpenStdin: true,
    });

    logger.info('Container created', { tag: 'docker', name, image, ip, id: container.id });
    return container.id;
  }

  async startContainer(id: string): Promise<void> {
    const container = docker.getContainer(id);
    await container.start();
    logger.info('Container started', { tag: 'docker', id });
  }

  async stopContainer(id: string): Promise<void> {
    try {
      const container = docker.getContainer(id);
      await container.stop({ t: 5 });
      logger.info('Container stopped', { tag: 'docker', id });
    } catch (err: any) {
      if (err.statusCode !== 304 && err.statusCode !== 404) throw err;
    }
  }

  async removeContainer(id: string): Promise<void> {
    try {
      const container = docker.getContainer(id);
      await container.remove({ force: true });
      logger.info('Container removed', { tag: 'docker', id });
    } catch (err: any) {
      if (err.statusCode !== 404) {
        logger.error('Failed to remove container', { tag: 'docker', id, error: String(err) });
        throw err;
      }
    }
  }

  /**
   * Run a command inside a container via Docker Engine API (dockerode).
   * This uses the Docker API directly — no shell spawning on the host.
   */
  async runInContainer(id: string, cmd: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const container = docker.getContainer(id);
    const dockerExec = await container.exec({
      Cmd: cmd,
      AttachStdout: true,
      AttachStderr: true,
    });

    const stream = await dockerExec.start({ hijack: true, stdin: false });

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', async () => {
        try {
          const info = await dockerExec.inspect();
          const output = Buffer.concat(chunks).toString('utf-8');
          resolve({
            stdout: output,
            stderr: '',
            exitCode: info.ExitCode ?? 0,
          });
        } catch (err) {
          reject(err);
        }
      });
      stream.on('error', reject);
    });
  }

  /**
   * Attach an interactive shell to a container via Docker Engine API.
   * Returns a duplex stream for bidirectional I/O.
   */
  async attachShell(id: string, user?: string): Promise<Duplex> {
    const container = docker.getContainer(id);
    const dockerExec = await container.exec({
      Cmd: ['/bin/bash'],
      User: user ?? '',
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
    });

    const stream = await dockerExec.start({ hijack: true, stdin: true, Tty: true });
    // Store exec ID on stream for resize
    (stream as any)._execId = dockerExec.id;
    return stream;
  }

  async resizeExec(dockerExecId: string, cols: number, rows: number): Promise<void> {
    try {
      await docker.getExec(dockerExecId).resize({ w: cols, h: rows });
    } catch {
      // Resize may fail if exec already exited
    }
  }

  async getContainerStatus(id: string): Promise<ContainerInfo | null> {
    try {
      const container = docker.getContainer(id);
      const info = await container.inspect();
      return {
        id: info.Id,
        name: info.Name,
        state: info.State.Status,
        status: info.State.Running ? 'running' : 'stopped',
      };
    } catch (err: any) {
      if (err.statusCode === 404) return null;
      throw err;
    }
  }

  async pruneLabResources(): Promise<void> {
    // Remove all containers and networks with biulms label
    const containers = await docker.listContainers({
      all: true,
      filters: { label: ['biulms=lab'] },
    });

    for (const c of containers) {
      try {
        await this.removeContainer(c.Id);
      } catch {
        // Best effort
      }
    }

    const networks = await docker.listNetworks({
      filters: { label: ['biulms=lab'] },
    });

    for (const n of networks) {
      try {
        await this.removeNetwork(n.Id);
      } catch {
        // Best effort
      }
    }

    logger.info('Lab resources pruned', { tag: 'docker', containers: containers.length, networks: networks.length });
  }

  async isAvailable(): Promise<boolean> {
    try {
      await docker.ping();
      return true;
    } catch {
      return false;
    }
  }

  async getLabResourceStats(): Promise<{ containers: number; networks: number }> {
    const containers = await docker.listContainers({
      all: true,
      filters: { label: ['biulms=lab'] },
    });
    const networks = await docker.listNetworks({
      filters: { label: ['biulms=lab'] },
    });
    return { containers: containers.length, networks: networks.length };
  }
}

export const dockerService = new DockerService();
