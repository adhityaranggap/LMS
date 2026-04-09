import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, lecturerOnly, AuthenticatedRequest } from '../auth';
import { logger } from '../services/logger';

const router = Router();

function isValidModuleId(moduleId: number): boolean {
  return (moduleId >= 1 && moduleId <= 16) || (moduleId >= 101 && moduleId <= 105) || moduleId >= 1001;
}

// GET /api/content/:moduleId — authenticated (students + lecturers can read)
router.get('/:moduleId', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const moduleId = Number(req.params.moduleId);
  if (!Number.isInteger(moduleId) || !isValidModuleId(moduleId)) {
    res.status(400).json({ error: 'Invalid moduleId.' });
    return;
  }

  const tenantId = (req as any)._tenantId ?? 1;

  // Custom module (id >= 1001): load from custom_modules table
  if (moduleId >= 1001) {
    try {
      const mod = db.prepare(
        'SELECT * FROM custom_modules WHERE module_number = ? AND tenant_id = ? AND is_published = 1'
      ).get(moduleId, tenantId) as Record<string, unknown> | undefined;
      if (!mod) {
        res.json({ override: null });
        return;
      }
      const content: Record<string, unknown> = {};
      for (const key of ['theory', 'lab', 'case_study', 'quiz', 'video_resources']) {
        if (mod[key] && typeof mod[key] === 'string') {
          try { content[key] = JSON.parse(mod[key] as string); } catch { content[key] = null; }
        }
      }
      content.title = mod.title;
      content.description = mod.description;
      res.json({ override: content, updatedAt: mod.updated_at, updatedBy: String(mod.created_by), isCustom: true });
    } catch (error) {
      logger.error('Custom module GET error', { error: String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
    return;
  }

  try {
    const row = db.prepare(
      'SELECT content, updated_at, updated_by FROM module_content_overrides WHERE module_id = ? AND tenant_id = ?'
    ).get(moduleId, tenantId) as { content: string; updated_at: string; updated_by: string } | undefined;

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
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  const tenantId = (req as any)._tenantId ?? 1;
  try {
    const rows = db.prepare(
      'SELECT module_id, updated_at, updated_by FROM module_content_overrides WHERE tenant_id = ? ORDER BY module_id'
    ).all(tenantId) as { module_id: number; updated_at: string; updated_by: string }[];

    res.json({ overrides: rows });
  } catch (error) {
    logger.error('Content list error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/content/:moduleId — upsert override (lecturer only)
router.put('/:moduleId', (req: AuthenticatedRequest, res: Response): void => {
  const moduleId = Number(req.params.moduleId);
  if (!Number.isInteger(moduleId) || !isValidModuleId(moduleId) || moduleId >= 1001) {
    res.status(400).json({ error: 'Invalid moduleId. Use /api/lecturer/modules/:id for custom modules.' });
    return;
  }

  const content = req.body;
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    res.status(400).json({ error: 'Request body must be a JSON object.' });
    return;
  }

  // Schema validation: only allow known top-level keys
  const ALLOWED_KEYS = ['theory', 'lab', 'caseStudy', 'caseStudyPool', 'quiz', 'videoResources', 'title', 'description'];
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
  const tenantId = (req as any)._tenantId ?? 1;

  try {
    // module_content_overrides has module_id as PK, but with tenant_id we need unique(module_id, tenant_id)
    // Use INSERT OR REPLACE pattern with tenant filter
    const existing = db.prepare('SELECT module_id FROM module_content_overrides WHERE module_id = ? AND tenant_id = ?').get(moduleId, tenantId);
    if (existing) {
      db.prepare(`UPDATE module_content_overrides SET content = ?, updated_by = ?, updated_at = datetime('now') WHERE module_id = ? AND tenant_id = ?`)
        .run(contentJson, updatedBy, moduleId, tenantId);
    } else {
      db.prepare(`INSERT INTO module_content_overrides (module_id, content, updated_by, tenant_id) VALUES (?, ?, ?, ?)`)
        .run(moduleId, contentJson, updatedBy, tenantId);
    }

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

  const tenantId = (req as any)._tenantId ?? 1;

  try {
    db.prepare('DELETE FROM module_content_overrides WHERE module_id = ? AND tenant_id = ?').run(moduleId, tenantId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Content DELETE error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
