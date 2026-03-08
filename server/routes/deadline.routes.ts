import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, lecturerOnly, AuthenticatedRequest } from '../auth';
import { logger } from '../services/logger';

const router = Router();

router.use(authMiddleware);

// GET /api/deadlines — list deadlines for current tenant
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  const tenantId = (req as any)._tenantId ?? 1;

  try {
    const rows = db.prepare(
      'SELECT * FROM deadlines WHERE tenant_id = ? ORDER BY due_at ASC'
    ).all(tenantId);
    res.json({ deadlines: rows });
  } catch (error) {
    logger.error('Deadlines fetch error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/deadlines — create or update deadline (lecturer only)
router.post('/', lecturerOnly, (req: AuthenticatedRequest, res: Response): void => {
  const tenantId = (req as any)._tenantId ?? 1;
  const { module_id, assessment_type, due_at } = req.body;

  if (!module_id || !assessment_type || !due_at) {
    res.status(400).json({ error: 'module_id, assessment_type, and due_at are required.' });
    return;
  }

  if (!['quiz', 'case', 'lab'].includes(assessment_type)) {
    res.status(400).json({ error: 'assessment_type must be quiz, case, or lab.' });
    return;
  }

  // Validate date format
  const dueDate = new Date(due_at);
  if (isNaN(dueDate.getTime())) {
    res.status(400).json({ error: 'Invalid due_at date format.' });
    return;
  }

  try {
    db.prepare(`
      INSERT INTO deadlines (tenant_id, module_id, assessment_type, due_at, created_by)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(tenant_id, module_id, assessment_type)
      DO UPDATE SET due_at = excluded.due_at, created_by = excluded.created_by
    `).run(tenantId, module_id, assessment_type, dueDate.toISOString(), Number(req.user!.id));

    res.json({ success: true });
  } catch (error) {
    logger.error('Deadline create error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/deadlines/:id — remove deadline (lecturer only)
router.delete('/:id', lecturerOnly, (req: AuthenticatedRequest, res: Response): void => {
  const tenantId = (req as any)._tenantId ?? 1;
  const { id } = req.params;

  try {
    const result = db.prepare(
      'DELETE FROM deadlines WHERE id = ? AND tenant_id = ?'
    ).run(Number(id), tenantId);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Deadline not found.' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Deadline delete error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
