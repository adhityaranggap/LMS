import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthenticatedRequest } from '../auth';

const router = Router();

router.use(authMiddleware);

// GET /api/notifications — list recent notifications
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const userType = req.user!.role === 'student' ? 'student' : 'lecturer';
  const tenantId = (req as any)._tenantId ?? 1;
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

  try {
    const rows = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ? AND user_type = ? AND tenant_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(userId, userType, tenantId, limit);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND user_type = ? AND tenant_id = ? AND is_read = 0
    `).get(userId, userType, tenantId) as { count: number };

    res.json({ notifications: rows, unread_count: unreadCount.count });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notifications/:id/read — mark as read
router.post('/:id/read', (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const userType = req.user!.role === 'student' ? 'student' : 'lecturer';
  const notifId = Number(req.params.id);

  try {
    db.prepare(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ? AND user_type = ?'
    ).run(notifId, userId, userType);

    res.json({ success: true });
  } catch (error) {
    console.error('Notification read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notifications/read-all — mark all as read
router.post('/read-all', (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const userType = req.user!.role === 'student' ? 'student' : 'lecturer';
  const tenantId = (req as any)._tenantId ?? 1;

  try {
    db.prepare(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND user_type = ? AND tenant_id = ?'
    ).run(userId, userType, tenantId);

    res.json({ success: true });
  } catch (error) {
    console.error('Notification read-all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/notifications/stream — SSE endpoint for real-time notifications
router.get('/stream', (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const userType = req.user!.role === 'student' ? 'student' : 'lecturer';
  const tenantId = (req as any)._tenantId ?? 1;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Send initial connection event
  res.write('data: {"type":"connected"}\n\n');

  // Poll for new notifications every 15 seconds
  let lastCheck = new Date().toISOString();
  const interval = setInterval(() => {
    try {
      const newNotifs = db.prepare(`
        SELECT * FROM notifications
        WHERE user_id = ? AND user_type = ? AND tenant_id = ? AND created_at > ?
        ORDER BY created_at ASC
      `).all(userId, userType, tenantId, lastCheck);

      if (newNotifs.length > 0) {
        lastCheck = new Date().toISOString();
        for (const notif of newNotifs) {
          res.write(`data: ${JSON.stringify({ type: 'notification', data: notif })}\n\n`);
        }
      }
    } catch {
      // ignore polling errors
    }
  }, 15000);

  // Heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(interval);
    clearInterval(heartbeat);
  });
});

export default router;

// Helper to create notifications from other services
export function createNotification(params: {
  tenant_id?: number;
  user_id: string;
  user_type: string;
  type: string;
  title: string;
  body?: string;
}): void {
  try {
    db.prepare(`
      INSERT INTO notifications (tenant_id, user_id, user_type, type, title, body)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      params.tenant_id ?? 1,
      params.user_id,
      params.user_type,
      params.type,
      params.title,
      params.body ?? null,
    );
  } catch (error) {
    console.error('Create notification error:', error);
  }
}
