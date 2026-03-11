import { IncomingMessage } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { Duplex } from 'stream';
import { verifyToken, AUTH_COOKIE_NAME } from '../auth';
import { labManager } from './lab-manager.service';
import { dockerService } from './docker.service';
import { logger } from './logger';
import db from '../db';

export function setupTerminalWebSocket(wss: WebSocketServer): void {
  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    const url = req.url || '';
    const match = url.match(/^\/ws\/terminal\/(\d+)\/(attacker|target)$/);

    if (!match) {
      ws.close(4000, 'Invalid path');
      return;
    }

    const envId = Number(match[1]);
    const containerType = match[2] as 'attacker' | 'target';

    // Authenticate via cookie
    const cookieHeader = req.headers.cookie || '';
    let token: string | null = null;
    for (const pair of cookieHeader.split(';')) {
      const eqIdx = pair.indexOf('=');
      if (eqIdx < 0) continue;
      const key = pair.substring(0, eqIdx).trim();
      if (key === AUTH_COOKIE_NAME) {
        token = decodeURIComponent(pair.substring(eqIdx + 1).trim());
        break;
      }
    }

    if (!token) {
      ws.close(4001, 'Authentication required');
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      ws.close(4001, 'Invalid token');
      return;
    }

    // Verify environment belongs to this student (or user is lecturer)
    const env = labManager.getEnvironment(envId);
    if (!env) {
      ws.close(4004, 'Environment not found');
      return;
    }

    if (payload.role === 'student' && env.student_id !== payload.id) {
      ws.close(4003, 'Access denied');
      return;
    }

    if (env.status !== 'running') {
      ws.close(4005, 'Environment not running');
      return;
    }

    const containerId = containerType === 'attacker'
      ? env.attacker_container_id
      : env.target_container_id;

    if (!containerId) {
      ws.close(4005, 'Container not available');
      return;
    }

    let shellStream: Duplex;

    try {
      shellStream = await dockerService.attachShell(containerId);
    } catch (err) {
      logger.error('Failed to attach shell', { tag: 'terminal', envId, containerType, error: String(err) });
      ws.close(4500, 'Failed to attach shell');
      return;
    }

    logger.info('Terminal connected', { tag: 'terminal', envId, containerType, userId: payload.id });

    // Bridge WebSocket ↔ Docker shell
    ws.on('message', (data: Buffer | string) => {
      try {
        const msg = typeof data === 'string' ? data : data.toString();

        // Handle resize messages
        if (msg.startsWith('\x01resize:')) {
          const parts = msg.substring(8).split(',');
          const cols = parseInt(parts[0], 10);
          const rows = parseInt(parts[1], 10);
          if (cols > 0 && rows > 0 && (shellStream as any)._execId) {
            dockerService.resizeExec((shellStream as any)._execId, cols, rows).catch(() => {});
          }
          return;
        }

        shellStream.write(data);
      } catch {
        // Stream may be closed
      }
    });

    shellStream.on('data', (chunk: Buffer) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(chunk);
      }
    });

    shellStream.on('end', () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Shell ended');
      }
    });

    shellStream.on('error', (err) => {
      logger.error('Shell stream error', { tag: 'terminal', envId, error: String(err) });
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(4500, 'Shell error');
      }
    });

    ws.on('close', () => {
      try {
        shellStream.end();
      } catch {
        // Already closed
      }
      logger.info('Terminal disconnected', { tag: 'terminal', envId, containerType });
    });

    ws.on('error', (err) => {
      logger.error('WebSocket error', { tag: 'terminal', envId, error: String(err) });
      try {
        shellStream.end();
      } catch {
        // Already closed
      }
    });

    // Update last activity periodically
    const activityInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        db.prepare("UPDATE lab_environments SET last_activity_at = datetime('now') WHERE id = ?").run(envId);
      } else {
        clearInterval(activityInterval);
      }
    }, 60000); // Every minute

    ws.on('close', () => clearInterval(activityInterval));
  });
}
