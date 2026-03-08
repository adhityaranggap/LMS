import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, lecturerOnly, requirePermission, AuthenticatedRequest } from '../auth';
import { logger } from '../services/logger';

const router = Router();

router.use(authMiddleware);
router.use(lecturerOnly);
router.use(requirePermission('manage_tenants'));

// GET /api/tenants — list all tenants (requires manage_tenants permission)
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const tenants = db.prepare('SELECT id, name, slug, logo_url, config, is_active, created_at FROM tenants ORDER BY id').all();
    res.json({ tenants });
  } catch (error) {
    logger.error('List tenants error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tenants — create tenant
router.post('/', (req: AuthenticatedRequest, res: Response): void => {
  const { name, slug, logo_url, config } = req.body;

  if (!name || typeof name !== 'string' || !slug || typeof slug !== 'string') {
    res.status(400).json({ error: 'name and slug are required.' });
    return;
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    res.status(400).json({ error: 'slug must contain only lowercase letters, numbers, and hyphens.' });
    return;
  }

  try {
    const result = db.prepare(
      'INSERT INTO tenants (name, slug, logo_url, config) VALUES (?, ?, ?, ?)'
    ).run(name, slug, logo_url || null, config ? JSON.stringify(config) : null);

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      res.status(409).json({ error: 'Tenant slug already exists.' });
      return;
    }
    logger.error('Create tenant error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/tenants/:id — update tenant
router.put('/:id', (req: AuthenticatedRequest, res: Response): void => {
  const tenantId = Number(req.params.id);
  if (!Number.isInteger(tenantId) || tenantId <= 0) {
    res.status(400).json({ error: 'Invalid tenant ID.' });
    return;
  }

  const { name, slug, logo_url, config, is_active } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM tenants WHERE id = ?').get(tenantId);
    if (!existing) {
      res.status(404).json({ error: 'Tenant not found.' });
      return;
    }

    const updates: string[] = [];
    const params: unknown[] = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (slug !== undefined) { updates.push('slug = ?'); params.push(slug); }
    if (logo_url !== undefined) { updates.push('logo_url = ?'); params.push(logo_url); }
    if (config !== undefined) { updates.push('config = ?'); params.push(JSON.stringify(config)); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update.' });
      return;
    }

    params.push(tenantId);
    db.prepare(`UPDATE tenants SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    res.json({ success: true });
  } catch (error) {
    logger.error('Update tenant error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tenants/:id/stats — tenant summary
router.get('/:id/stats', (req: AuthenticatedRequest, res: Response): void => {
  const tenantId = Number(req.params.id);
  if (!Number.isInteger(tenantId) || tenantId <= 0) {
    res.status(400).json({ error: 'Invalid tenant ID.' });
    return;
  }

  try {
    const totalStudents = db.prepare(
      'SELECT COUNT(*) as count FROM students WHERE tenant_id = ?'
    ).get(tenantId) as { count: number };

    const totalLecturers = db.prepare(
      'SELECT COUNT(*) as count FROM lecturers WHERE tenant_id = ?'
    ).get(tenantId) as { count: number };

    const totalQuizAttempts = db.prepare(
      'SELECT COUNT(*) as count FROM quiz_attempts WHERE tenant_id = ?'
    ).get(tenantId) as { count: number };

    const avgScore = db.prepare(
      'SELECT ROUND(AVG(score), 1) as avg FROM quiz_attempts WHERE tenant_id = ? AND score IS NOT NULL'
    ).get(tenantId) as { avg: number | null };

    res.json({
      tenantId,
      totalStudents: totalStudents.count,
      totalLecturers: totalLecturers.count,
      totalQuizAttempts: totalQuizAttempts.count,
      avgQuizScore: avgScore.avg,
    });
  } catch (error) {
    logger.error('Tenant stats error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
