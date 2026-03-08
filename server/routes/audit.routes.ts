import { Router, Request, Response, NextFunction } from 'express';
import db from '../db';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { logAudit } from '../services/audit.service';
import { logger } from '../services/logger';

const router = Router();

router.use(authMiddleware);

// --- Rate Limiting for audit track endpoint ---
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const auditRateLimitMap = new Map<string, RateLimitEntry>();
const AUDIT_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const AUDIT_RATE_LIMIT_MAX = 60;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of auditRateLimitMap) {
    if (entry.resetAt <= now) auditRateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

function auditRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = auditRateLimitMap.get(ip);

  if (!entry || entry.resetAt <= now) {
    auditRateLimitMap.set(ip, { count: 1, resetAt: now + AUDIT_RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  entry.count++;
  if (entry.count > AUDIT_RATE_LIMIT_MAX) {
    res.status(429).json({ error: 'Too many audit requests. Try again later.' });
    return;
  }
  next();
}

// POST /api/audit/track — batched client-side events
router.post('/track', auditRateLimit, (req: AuthenticatedRequest, res: Response): void => {
  const events = req.body.events;
  if (!Array.isArray(events) || events.length === 0 || events.length > 50) {
    res.status(400).json({ error: 'events must be an array (1-50 items).' });
    return;
  }

  const tenantId = (req as any).tenantId ?? 1;
  const userId = req.user?.id;
  const userType = req.user?.role;
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || '';

  for (const event of events) {
    if (!event || typeof event.action !== 'string') continue;
    logAudit({
      tenant_id: tenantId,
      user_id: userId,
      user_type: userType,
      session_id: event.session_id,
      action: event.action,
      resource_type: event.resource_type,
      resource_id: event.resource_id,
      details: event.details,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  res.json({ success: true });
});

// POST /api/audit/device-info — device fingerprint per session
router.post('/device-info', (req: AuthenticatedRequest, res: Response): void => {
  const { session_id, screen_width, screen_height, timezone, language, platform } = req.body;

  if (!session_id || typeof session_id !== 'string') {
    res.status(400).json({ error: 'session_id is required.' });
    return;
  }

  try {
    db.prepare(`
      INSERT INTO session_device_info (session_id, user_id, ip_address, user_agent, screen_width, screen_height, timezone, language, platform)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      session_id,
      req.user!.id,
      req.ip || req.socket.remoteAddress || 'unknown',
      req.headers['user-agent'] || '',
      screen_width ?? null,
      screen_height ?? null,
      timezone ?? null,
      language ?? null,
      platform ?? null,
    );

    res.json({ success: true });
  } catch (error) {
    logger.error('Device info error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/audit/logs — paginated, filterable (lecturer only)
router.get('/logs', (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'lecturer') {
    res.status(403).json({ error: 'Lecturer access required.' });
    return;
  }

  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const studentId = typeof req.query.student_id === 'string' ? req.query.student_id : null;
  const action = typeof req.query.action === 'string' ? req.query.action : null;
  const dateFrom = typeof req.query.date_from === 'string' ? req.query.date_from : null;
  const dateTo = typeof req.query.date_to === 'string' ? req.query.date_to : null;
  const tenantId = (req as any).tenantId ?? 1;

  try {
    let where = 'WHERE al.tenant_id = ?';
    const params: unknown[] = [tenantId];

    if (studentId) {
      where += ' AND al.user_id = ?';
      params.push(studentId);
    }
    if (action) {
      where += ' AND al.action = ?';
      params.push(action);
    }
    if (dateFrom) {
      where += ' AND al.created_at >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      where += ' AND al.created_at <= ?';
      params.push(dateTo);
    }

    const total = db.prepare(`SELECT COUNT(*) as count FROM audit_logs al ${where}`).get(...params) as { count: number };

    const logs = db.prepare(`
      SELECT al.id, al.user_id, al.user_type, al.session_id, al.action, al.resource_type, al.resource_id, al.details, al.ip_address, al.user_agent, al.created_at,
        CASE WHEN al.user_type = 'lecturer'
          THEN (SELECT display_name FROM lecturers WHERE id = CAST(al.user_id AS INTEGER))
          ELSE NULL END as display_name
      FROM audit_logs al ${where}
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({ logs, total: total.count });
  } catch (error) {
    logger.error('Audit logs error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/audit/student/:studentId/timeline — student activity timeline
router.get('/student/:studentId/timeline', (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'lecturer') {
    res.status(403).json({ error: 'Lecturer access required.' });
    return;
  }

  const { studentId } = req.params;
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
  const tenantId = (req as any).tenantId ?? 1;

  try {
    const timeline = db.prepare(`
      SELECT id, action, resource_type, resource_id, details, ip_address, created_at
      FROM audit_logs
      WHERE user_id = ? AND tenant_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(studentId, tenantId, limit);

    res.json({ timeline });
  } catch (error) {
    logger.error('Student timeline error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
