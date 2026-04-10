import db from '../db';
import { dockerService } from './docker.service';
import { logger } from './logger';
import { logAudit } from './audit.service';

const MAX_CONCURRENT_ENVIRONMENTS = Number(process.env.LAB_MAX_CONCURRENT) || 10;
const DEFAULT_TIME_LIMIT_MINUTES = 120;
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export interface LabEnvironment {
  id: number;
  student_id: string;
  template_id: number;
  module_id: number;
  attacker_container_id: string;
  target_container_id: string;
  network_id: string;
  network_name: string;
  attacker_ip: string;
  target_ip: string;
  status: string;
  started_at: string;
  expires_at: string;
}

export interface LabTemplate {
  id: number;
  module_id: number;
  name: string;
  description: string;
  attacker_image: string;
  target_image: string;
  attacker_memory_mb: number;
  target_memory_mb: number;
  time_limit_minutes: number;
  objectives: string;
  is_active: number;
}

export interface ObjectiveResult {
  id: number;
  description: string;
  passed: boolean;
  output?: string;
}

// Allocate unique subnet per student — uses a counter
let subnetCounter = 1;
function allocateSubnet(): { subnet: string; attackerIp: string; targetIp: string } {
  const x = subnetCounter++;
  if (subnetCounter > 250) subnetCounter = 1;
  return {
    subnet: `10.10.${x}.0/24`,
    attackerIp: `10.10.${x}.2`,
    targetIp: `10.10.${x}.3`,
  };
}

// On startup, advance subnetCounter past any already-in-use subnets so restarts
// don't collide with still-running lab networks.
async function initSubnetCounter(): Promise<void> {
  try {
    const Docker = (await import('dockerode')).default;
    const docker = new Docker({ socketPath: '/var/run/docker.sock' });
    const networks = await docker.listNetworks({ filters: { label: ['biulms=lab'] } });
    let maxX = 0;
    for (const n of networks) {
      const info = await docker.getNetwork(n.Id).inspect() as { IPAM?: { Config?: { Subnet?: string }[] } };
      const subnet = info.IPAM?.Config?.[0]?.Subnet;
      if (subnet) {
        const match = subnet.match(/^10\.10\.(\d+)\./);
        if (match) maxX = Math.max(maxX, Number(match[1]));
      }
    }
    if (maxX > 0) {
      subnetCounter = maxX + 1;
      logger.info('Subnet counter initialized from existing networks', { tag: 'lab', subnetCounter });
    }
  } catch {
    // Docker not available — counter stays at 1
  }
}

void initSubnetCounter();

export class LabManager {
  async provisionEnvironment(
    studentId: string,
    moduleId: number,
    tenantId: number = 1,
  ): Promise<LabEnvironment> {
    // Check for existing running environment for this student
    const existing = db.prepare(
      "SELECT * FROM lab_environments WHERE student_id = ? AND status IN ('running', 'pending') LIMIT 1"
    ).get(studentId) as LabEnvironment | undefined;

    if (existing) {
      if (existing.module_id === moduleId) {
        return existing;
      }
      // Destroy old environment first
      await this.destroyEnvironment(existing.id);
    }

    // Check concurrent limit
    const activeCount = db.prepare(
      "SELECT COUNT(*) as c FROM lab_environments WHERE status = 'running'"
    ).get() as { c: number };

    if (activeCount.c >= MAX_CONCURRENT_ENVIRONMENTS) {
      throw new Error('Maximum concurrent lab environments reached. Please try again later.');
    }

    // Get template
    const template = db.prepare(
      'SELECT * FROM lab_templates WHERE module_id = ? AND is_active = 1'
    ).get(moduleId) as LabTemplate | undefined;

    if (!template) {
      throw new Error(`No lab template configured for module ${moduleId}`);
    }

    const { subnet, attackerIp, targetIp } = allocateSubnet();
    const networkName = `biulms-lab-${studentId}-${moduleId}`;
    const attackerName = `biulms-atk-${studentId}`;
    const targetName = `biulms-tgt-${studentId}`;

    // Insert pending record
    const timeLimitMinutes = template.time_limit_minutes || DEFAULT_TIME_LIMIT_MINUTES;
    const expiresAt = new Date(Date.now() + timeLimitMinutes * 60 * 1000).toISOString();

    const insertResult = db.prepare(`
      INSERT INTO lab_environments
        (tenant_id, student_id, template_id, network_name, attacker_ip, target_ip,
         status, module_id, started_at, expires_at, last_activity_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, datetime('now'), ?, datetime('now'), datetime('now'))
    `).run(tenantId, studentId, template.id, networkName, attackerIp, targetIp, moduleId, expiresAt);

    const envId = insertResult.lastInsertRowid as number;

    try {
      // Create isolated Docker network
      const networkId = await dockerService.createNetwork(networkName, subnet);

      // Create attacker container
      const attackerContainerId = await dockerService.createContainer(
        template.attacker_image,
        attackerName,
        networkName,
        attackerIp,
        { LAB_MODULE: String(moduleId), TARGET_IP: targetIp },
        template.attacker_memory_mb || 384
      );

      // Create target container
      const targetContainerId = await dockerService.createContainer(
        template.target_image,
        targetName,
        networkName,
        targetIp,
        { LAB_MODULE: String(moduleId) },
        template.target_memory_mb || 384
      );

      // Start containers
      await dockerService.startContainer(targetContainerId);
      await dockerService.startContainer(attackerContainerId);

      // Wait for target setup to complete (max 30s)
      await this.waitForTargetReady(targetContainerId, 30000);

      // Update DB with container IDs
      db.prepare(`
        UPDATE lab_environments
        SET attacker_container_id = ?, target_container_id = ?, network_id = ?, status = 'running'
        WHERE id = ?
      `).run(attackerContainerId, targetContainerId, networkId, envId);

      // Start session tracking
      db.prepare(`
        INSERT INTO lab_sessions (tenant_id, environment_id, student_id, module_id, started_at, created_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(tenantId, envId, studentId, moduleId);

      logAudit({
        user_id: studentId,
        user_type: 'student',
        action: 'lab_provision',
        resource_type: 'lab_environment',
        resource_id: String(envId),
        details: { moduleId, networkName },
      });

      const env = db.prepare('SELECT * FROM lab_environments WHERE id = ?').get(envId) as LabEnvironment;
      logger.info('Lab environment provisioned', { tag: 'lab', envId, studentId, moduleId });
      return env;
    } catch (err) {
      // Cleanup on failure
      db.prepare("UPDATE lab_environments SET status = 'failed', error_message = ? WHERE id = ?")
        .run(String(err), envId);

      // Best-effort cleanup of Docker resources
      try {
        const containers = [attackerName, targetName];
        for (const name of containers) {
          try {
            const info = await dockerService.getContainerStatus(name);
            if (info) await dockerService.removeContainer(info.id);
          } catch { /* ignore */ }
        }
        await dockerService.removeNetwork(networkName).catch(() => {});
      } catch { /* ignore */ }

      logger.error('Failed to provision lab environment', { tag: 'lab', envId, error: String(err) });
      throw err;
    }
  }

  private async waitForTargetReady(containerId: string, timeoutMs: number): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const result = await dockerService.runInContainer(containerId, ['test', '-f', '/tmp/.lab-setup-done']);
        if (result.exitCode === 0) return;
      } catch { /* not ready yet */ }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    logger.warn('Target setup timed out, continuing anyway', { tag: 'lab', containerId });
  }

  async destroyEnvironment(envId: number): Promise<void> {
    const env = db.prepare('SELECT * FROM lab_environments WHERE id = ?').get(envId) as LabEnvironment | undefined;
    if (!env) return;

    db.prepare("UPDATE lab_environments SET status = 'stopping' WHERE id = ?").run(envId);

    try {
      // Stop and remove containers
      if (env.attacker_container_id) {
        await dockerService.stopContainer(env.attacker_container_id);
        await dockerService.removeContainer(env.attacker_container_id);
      }
      if (env.target_container_id) {
        await dockerService.stopContainer(env.target_container_id);
        await dockerService.removeContainer(env.target_container_id);
      }
      // Remove network
      if (env.network_id) {
        await dockerService.removeNetwork(env.network_id);
      }
    } catch (err) {
      logger.error('Error during environment cleanup', { tag: 'lab', envId, error: String(err) });
    }

    db.prepare("UPDATE lab_environments SET status = 'destroyed' WHERE id = ?").run(envId);

    // End session
    db.prepare(`
      UPDATE lab_sessions SET ended_at = datetime('now'),
        duration_seconds = CAST((julianday('now') - julianday(started_at)) * 86400 AS INTEGER)
      WHERE environment_id = ? AND ended_at IS NULL
    `).run(envId);

    logAudit({
      user_id: env.student_id,
      user_type: 'student',
      action: 'lab_destroy',
      resource_type: 'lab_environment',
      resource_id: String(envId),
    });

    logger.info('Lab environment destroyed', { tag: 'lab', envId });
  }

  async resetTarget(envId: number): Promise<void> {
    const env = db.prepare('SELECT * FROM lab_environments WHERE id = ?').get(envId) as LabEnvironment | undefined;
    if (!env || env.status !== 'running') {
      throw new Error('Environment not running');
    }

    const template = db.prepare('SELECT * FROM lab_templates WHERE id = ?').get(env.template_id) as LabTemplate;

    // Stop and remove old target
    if (env.target_container_id) {
      await dockerService.stopContainer(env.target_container_id);
      await dockerService.removeContainer(env.target_container_id);
    }

    // Create new target
    const targetName = `biulms-tgt-${env.student_id}`;
    const newContainerId = await dockerService.createContainer(
      template.target_image,
      targetName,
      env.network_name,
      env.target_ip,
      { LAB_MODULE: String(env.module_id) },
      template.target_memory_mb || 384
    );

    await dockerService.startContainer(newContainerId);
    await this.waitForTargetReady(newContainerId, 30000);

    db.prepare('UPDATE lab_environments SET target_container_id = ?, last_activity_at = datetime(\'now\') WHERE id = ?')
      .run(newContainerId, envId);

    logAudit({
      user_id: env.student_id,
      user_type: 'student',
      action: 'lab_reset_target',
      resource_type: 'lab_environment',
      resource_id: String(envId),
    });

    logger.info('Target container reset', { tag: 'lab', envId });
  }

  async checkObjectives(envId: number): Promise<ObjectiveResult[]> {
    const env = db.prepare('SELECT * FROM lab_environments WHERE id = ?').get(envId) as LabEnvironment | undefined;
    if (!env || env.status !== 'running') {
      throw new Error('Environment not running');
    }

    const template = db.prepare('SELECT * FROM lab_templates WHERE id = ?').get(env.template_id) as LabTemplate;
    if (!template.objectives) return [];

    const objectives = JSON.parse(template.objectives) as Array<{
      id: number;
      description: string;
      check_command: string;
      container?: 'attacker' | 'target';
    }>;

    const results: ObjectiveResult[] = [];
    for (const obj of objectives) {
      const containerId = obj.container === 'target'
        ? env.target_container_id
        : env.attacker_container_id;

      try {
        const result = await dockerService.runInContainer(containerId, ['bash', '-c', obj.check_command]);
        results.push({
          id: obj.id,
          description: obj.description,
          passed: result.exitCode === 0,
          output: result.stdout.trim().substring(0, 200),
        });
      } catch {
        results.push({
          id: obj.id,
          description: obj.description,
          passed: false,
        });
      }
    }

    // Calculate score
    const passedCount = results.filter(r => r.passed).length;
    const score = objectives.length > 0 ? Math.round((passedCount / objectives.length) * 100) : 0;

    // Update session
    db.prepare(`
      UPDATE lab_sessions SET objectives_completed = ?, auto_grade_score = ?
      WHERE environment_id = ? AND ended_at IS NULL
    `).run(JSON.stringify(results.map(r => r.passed)), score, envId);

    return results;
  }

  async cleanupExpired(): Promise<number> {
    const expired = db.prepare(`
      SELECT id FROM lab_environments
      WHERE status = 'running' AND expires_at < datetime('now')
    `).all() as { id: number }[];

    const idle = db.prepare(`
      SELECT id FROM lab_environments
      WHERE status = 'running' AND last_activity_at < datetime('now', '-30 minutes')
    `).all() as { id: number }[];

    const toDestroy = new Set([...expired.map(e => e.id), ...idle.map(e => e.id)]);
    let count = 0;

    for (const envId of toDestroy) {
      try {
        await this.destroyEnvironment(envId);
        count++;
      } catch (err) {
        logger.error('Failed to cleanup expired env', { tag: 'lab', envId, error: String(err) });
      }
    }

    if (count > 0) {
      logger.info('Cleaned up expired/idle lab environments', { tag: 'lab', count });
    }
    return count;
  }

  async destroyAll(): Promise<number> {
    const active = db.prepare(
      "SELECT id FROM lab_environments WHERE status IN ('running', 'pending')"
    ).all() as { id: number }[];

    let count = 0;
    for (const env of active) {
      try {
        await this.destroyEnvironment(env.id);
        count++;
      } catch {
        // Continue best-effort
      }
    }
    return count;
  }

  async getStats(): Promise<{
    active: number;
    total_sessions: number;
    avg_duration_minutes: number;
    docker: { containers: number; networks: number };
  }> {
    const active = db.prepare(
      "SELECT COUNT(*) as c FROM lab_environments WHERE status = 'running'"
    ).get() as { c: number };

    const totalSessions = db.prepare(
      'SELECT COUNT(*) as c FROM lab_sessions'
    ).get() as { c: number };

    const avgDuration = db.prepare(
      'SELECT AVG(duration_seconds) as avg FROM lab_sessions WHERE duration_seconds IS NOT NULL'
    ).get() as { avg: number | null };

    const docker = await dockerService.getLabResourceStats();

    return {
      active: active.c,
      total_sessions: totalSessions.c,
      avg_duration_minutes: Math.round((avgDuration.avg || 0) / 60),
      docker,
    };
  }

  getEnvironment(envId: number): LabEnvironment | undefined {
    return db.prepare('SELECT * FROM lab_environments WHERE id = ?').get(envId) as LabEnvironment | undefined;
  }

  getStudentEnvironment(studentId: string, moduleId: number): LabEnvironment | undefined {
    return db.prepare(
      "SELECT * FROM lab_environments WHERE student_id = ? AND module_id = ? AND status = 'running' LIMIT 1"
    ).get(studentId, moduleId) as LabEnvironment | undefined;
  }
}

export const labManager = new LabManager();
