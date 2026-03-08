import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, lecturerOnly, AuthenticatedRequest } from '../auth';
import { logger } from '../services/logger';

const router = Router();

function isValidModuleId(moduleId: number): boolean {
  return (moduleId >= 1 && moduleId <= 16) || (moduleId >= 101 && moduleId <= 105);
}

// GET /api/content/:moduleId — authenticated (students + lecturers can read)
router.get('/:moduleId', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const moduleId = Number(req.params.moduleId);
  if (!Number.isInteger(moduleId) || !isValidModuleId(moduleId)) {
    res.status(400).json({ error: 'Invalid moduleId.' });
    return;
  }

  try {
    const row = db.prepare(
      'SELECT content, updated_at, updated_by FROM module_content_overrides WHERE module_id = ?'
    ).get(moduleId) as { content: string; updated_at: string; updated_by: string } | undefined;

    if (!row) {
      res.json({ override: null });
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(row.content);
    } catch {
      res.json({ override: null });
      return;
    }

    res.json({ override: parsed, updatedAt: row.updated_at, updatedBy: row.updated_by });
  } catch (error) {
    logger.error('Content GET error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply auth + lecturer-only to mutating routes
router.use(authMiddleware);
router.use(lecturerOnly);

// GET /api/content — list all module override statuses
router.get('/', (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const rows = db.prepare(
      'SELECT module_id, updated_at, updated_by FROM module_content_overrides ORDER BY module_id'
    ).all() as { module_id: number; updated_at: string; updated_by: string }[];

    res.json({ overrides: rows });
  } catch (error) {
    logger.error('Content list error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/content/:moduleId — upsert override (lecturer only)
router.put('/:moduleId', (req: AuthenticatedRequest, res: Response): void => {
  const moduleId = Number(req.params.moduleId);
  if (!Number.isInteger(moduleId) || !isValidModuleId(moduleId)) {
    res.status(400).json({ error: 'Invalid moduleId.' });
    return;
  }

  const content = req.body;
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    res.status(400).json({ error: 'Request body must be a JSON object.' });
    return;
  }

  // Schema validation: only allow known top-level keys
  const ALLOWED_KEYS = ['theory', 'lab', 'caseStudy', 'quiz', 'videoResources', 'title', 'description'];
  const bodyKeys = Object.keys(content);
  const invalidKeys = bodyKeys.filter(k => !ALLOWED_KEYS.includes(k));
  if (invalidKeys.length > 0) {
    res.status(400).json({ error: `Invalid content keys: ${invalidKeys.join(', ')}. Allowed: ${ALLOWED_KEYS.join(', ')}` });
    return;
  }

  // Validate nested types
  if (content.theory !== undefined && !Array.isArray(content.theory)) {
    res.status(400).json({ error: 'theory must be an array.' });
    return;
  }
  if (content.quiz !== undefined && !Array.isArray(content.quiz)) {
    res.status(400).json({ error: 'quiz must be an array.' });
    return;
  }
  if (content.lab !== undefined && (typeof content.lab !== 'object' || content.lab === null)) {
    res.status(400).json({ error: 'lab must be an object.' });
    return;
  }

  let contentJson: string;
  try {
    contentJson = JSON.stringify(content);
  } catch {
    res.status(400).json({ error: 'Failed to serialize content.' });
    return;
  }

  // Reject excessively large payloads
  if (contentJson.length > 2 * 1024 * 1024) {
    res.status(400).json({ error: 'Content too large (max 2MB).' });
    return;
  }

  const updatedBy = req.user!.id;

  try {
    db.prepare(`
      INSERT INTO module_content_overrides (module_id, content, updated_by)
      VALUES (?, ?, ?)
      ON CONFLICT(module_id) DO UPDATE SET
        content = excluded.content,
        updated_by = excluded.updated_by,
        updated_at = datetime('now')
    `).run(moduleId, contentJson, updatedBy);

    res.json({ success: true });
  } catch (error) {
    logger.error('Content PUT error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/content/:moduleId — remove override (lecturer only)
router.delete('/:moduleId', (req: AuthenticatedRequest, res: Response): void => {
  const moduleId = Number(req.params.moduleId);
  if (!Number.isInteger(moduleId) || !isValidModuleId(moduleId)) {
    res.status(400).json({ error: 'Invalid moduleId.' });
    return;
  }

  try {
    db.prepare('DELETE FROM module_content_overrides WHERE module_id = ?').run(moduleId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Content DELETE error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
