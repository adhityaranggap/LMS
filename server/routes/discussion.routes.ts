import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { logger } from '../services/logger';

const router = Router();

router.use(authMiddleware);

// Rate limit: 5 posts per minute per user
const postRateMap = new Map<string, { count: number; resetAt: number }>();
const POST_RATE_LIMIT_WINDOW = 60 * 1000;
const POST_RATE_LIMIT_MAX = 5;

function checkPostRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = postRateMap.get(userId);
  if (!entry || entry.resetAt <= now) {
    postRateMap.set(userId, { count: 1, resetAt: now + POST_RATE_LIMIT_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= POST_RATE_LIMIT_MAX;
}

// Cleanup rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of postRateMap) {
    if (entry.resetAt <= now) postRateMap.delete(key);
  }
}, 5 * 60 * 1000);

// GET /api/discussions/:moduleId — list threads (paginated)
router.get('/:moduleId', (req: AuthenticatedRequest, res: Response): void => {
  const tenantId = (req as any)._tenantId ?? 1;
  const moduleId = Number(req.params.moduleId);
  const page = Math.max(0, Number(req.query.page) || 0);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const offset = page * limit;

  try {
    const total = db.prepare(
      'SELECT COUNT(*) as count FROM discussions WHERE module_id = ? AND tenant_id = ? AND parent_id IS NULL'
    ).get(moduleId, tenantId) as { count: number };

    const threads = db.prepare(`
      SELECT d.*, s.student_id as author_name,
        CASE WHEN d.user_type = 'lecturer' THEN 1 ELSE 0 END as is_lecturer,
        (SELECT COUNT(*) FROM discussions r WHERE r.parent_id = d.id) as reply_count
      FROM discussions d
      LEFT JOIN students s ON d.student_id = s.student_id
      WHERE d.module_id = ? AND d.tenant_id = ? AND d.parent_id IS NULL
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `).all(moduleId, tenantId, limit, offset);

    res.json({ threads, total: total.count, page, limit });
  } catch (error) {
    logger.error('Discussion list error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/discussions/:moduleId/:threadId/replies — get replies to a thread
router.get('/:moduleId/:threadId/replies', (req: AuthenticatedRequest, res: Response): void => {
  const tenantId = (req as any)._tenantId ?? 1;
  const threadId = Number(req.params.threadId);

  try {
    const replies = db.prepare(`
      SELECT d.*,
        CASE WHEN d.user_type = 'lecturer' THEN 1 ELSE 0 END as is_lecturer
      FROM discussions d
      WHERE d.parent_id = ? AND d.tenant_id = ?
      ORDER BY d.created_at ASC
    `).all(threadId, tenantId);

    res.json({ replies });
  } catch (error) {
    logger.error('Discussion replies error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/discussions/:moduleId — create post
router.post('/:moduleId', (req: AuthenticatedRequest, res: Response): void => {
  const tenantId = (req as any)._tenantId ?? 1;
  const moduleId = Number(req.params.moduleId);
  const userId = req.user!.id;
  const userType = req.user!.role === 'student' ? 'student' : 'lecturer';
  const { content, parent_id } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    res.status(400).json({ error: 'Content is required.' });
    return;
  }

  if (content.length > 5000) {
    res.status(400).json({ error: 'Content too long (max 5000 characters).' });
    return;
  }

  if (!checkPostRateLimit(userId)) {
    res.status(429).json({ error: 'Too many posts. Try again later.' });
    return;
  }

  try {
    const result = db.prepare(`
      INSERT INTO discussions (tenant_id, module_id, student_id, user_type, content, parent_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(tenantId, moduleId, userId, userType, content.trim(), parent_id || null);

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    logger.error('Discussion post error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/discussions/:id — delete own post or lecturer can delete any
router.delete('/:id', (req: AuthenticatedRequest, res: Response): void => {
  const tenantId = (req as any)._tenantId ?? 1;
  const postId = Number(req.params.id);
  const userId = req.user!.id;
  const isLecturer = req.user!.role !== 'student';

  try {
    const post = db.prepare(
      'SELECT student_id, user_type FROM discussions WHERE id = ? AND tenant_id = ?'
    ).get(postId, tenantId) as { student_id: string; user_type: string } | undefined;

    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    if (!isLecturer && post.student_id !== userId) {
      res.status(403).json({ error: 'Cannot delete another user\'s post.' });
      return;
    }

    // Delete replies first, then the post
    db.transaction(() => {
      db.prepare('DELETE FROM discussions WHERE parent_id = ?').run(postId);
      db.prepare('DELETE FROM discussions WHERE id = ?').run(postId);
    })();

    res.json({ success: true });
  } catch (error) {
    logger.error('Discussion delete error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
