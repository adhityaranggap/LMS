import { Router, Response, NextFunction } from 'express';
import db from '../db';
import { authMiddleware, studentOnly, AuthenticatedRequest } from '../auth';
import { labManager } from '../services/lab-manager.service';
import { dockerService } from '../services/docker.service';
import { logAudit } from '../services/audit.service';
import { logger } from '../services/logger';

const router = Router();
router.use(authMiddleware);

// Lab admin access: lecturer, tenant_admin, or super_admin
function labAdminOnly(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || !['lecturer', 'tenant_admin', 'super_admin'].includes(req.user.role)) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

// Rate limit provisioning per student (30s cooldown) to prevent Docker daemon DoS
const provisionTimestamps = new Map<string, number>();
const PROVISION_COOLDOWN_MS = 30_000;

// --- Student endpoints ---

// GET /api/labs/templates — List available lab templates
router.get('/templates', (req: AuthenticatedRequest, res: Response) => {
  const templates = db.prepare(
    'SELECT id, module_id, name, description, time_limit_minutes, objectives, is_active FROM lab_templates WHERE is_active = 1'
  ).all();
  res.json(templates);
});

// GET /api/labs/status/:moduleId — Get my environment status for a module
router.get('/status/:moduleId', studentOnly, (req: AuthenticatedRequest, res: Response) => {
  const moduleId = Number(req.params.moduleId);
  const env = labManager.getStudentEnvironment(req.user!.id, moduleId);
  if (!env) {
    res.json({ status: 'none' });
    return;
  }
  res.json({
    status: env.status,
    id: env.id,
    attacker_ip: env.attacker_ip,
    target_ip: env.target_ip,
    started_at: env.started_at,
    expires_at: env.expires_at,
  });
});

// POST /api/labs/provision/:moduleId — Provision containers
router.post('/provision/:moduleId', studentOnly, async (req: AuthenticatedRequest, res: Response) => {
  const moduleId = Number(req.params.moduleId);
  const studentId = req.user!.id;

  // Enforce cooldown to prevent Docker daemon DoS
  const lastProvision = provisionTimestamps.get(studentId) || 0;
  if (Date.now() - lastProvision < PROVISION_COOLDOWN_MS) {
    res.status(429).json({ error: 'Please wait 30 seconds before provisioning a new lab' });
    return;
  }
  provisionTimestamps.set(studentId, Date.now());

  try {
    // Check Docker availability
    const available = await dockerService.isAvailable();
    if (!available) {
      res.status(503).json({ error: 'Lab service unavailable. Docker is not running.' });
      return;
    }

    const env = await labManager.provisionEnvironment(
      studentId,
      moduleId,
      req.user!.tenant_id ?? 1,
    );

    res.json({
      id: env.id,
      status: env.status,
      attacker_ip: env.attacker_ip,
      target_ip: env.target_ip,
      started_at: env.started_at,
      expires_at: env.expires_at,
    });
  } catch (err: any) {
    logger.error('Failed to provision lab', { tag: 'lab', error: String(err) });
    res.status(500).json({ error: err.message || 'Failed to provision lab environment' });
  }
});

// POST /api/labs/stop/:envId — Stop environment
router.post('/stop/:envId', studentOnly, async (req: AuthenticatedRequest, res: Response) => {
  const envId = Number(req.params.envId);
  const env = labManager.getEnvironment(envId);

  if (!env || env.student_id !== req.user!.id) {
    res.status(404).json({ error: 'Environment not found' });
    return;
  }

  try {
    await labManager.destroyEnvironment(envId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/labs/reset-target/:envId — Reset target container
router.post('/reset-target/:envId', studentOnly, async (req: AuthenticatedRequest, res: Response) => {
  const envId = Number(req.params.envId);
  const env = labManager.getEnvironment(envId);

  if (!env || env.student_id !== req.user!.id) {
    res.status(404).json({ error: 'Environment not found' });
    return;
  }

  try {
    await labManager.resetTarget(envId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/labs/check-objectives/:envId — Run objective checks
router.post('/check-objectives/:envId', studentOnly, async (req: AuthenticatedRequest, res: Response) => {
  const envId = Number(req.params.envId);
  const env = labManager.getEnvironment(envId);

  if (!env || env.student_id !== req.user!.id) {
    res.status(404).json({ error: 'Environment not found' });
    return;
  }

  try {
    const results = await labManager.checkObjectives(envId);
    const passedCount = results.filter(r => r.passed).length;
    res.json({
      results,
      score: results.length > 0 ? Math.round((passedCount / results.length) * 100) : 0,
      passed: passedCount,
      total: results.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Lecturer/Admin endpoints ---

// GET /api/labs/admin/environments — All active environments
router.get('/admin/environments', labAdminOnly, (_req: AuthenticatedRequest, res: Response) => {
  const environments = db.prepare(`
    SELECT le.*, s.full_name as student_name, lt.name as template_name
    FROM lab_environments le
    LEFT JOIN students s ON s.student_id = le.student_id
    LEFT JOIN lab_templates lt ON lt.id = le.template_id
    WHERE le.status IN ('running', 'pending')
    ORDER BY le.created_at DESC
  `).all();
  res.json(environments);
});

// POST /api/labs/admin/destroy/:envId — Force-destroy
router.post('/admin/destroy/:envId', labAdminOnly, async (req: AuthenticatedRequest, res: Response) => {
  const envId = Number(req.params.envId);
  try {
    await labManager.destroyEnvironment(envId);
    logAudit({
      user_id: req.user!.id,
      user_type: 'lecturer',
      action: 'lab_admin_destroy',
      resource_type: 'lab_environment',
      resource_id: String(envId),
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/labs/admin/destroy-all — Emergency destroy all
router.post('/admin/destroy-all', labAdminOnly, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const count = await labManager.destroyAll();
    logAudit({
      user_id: req.user!.id,
      user_type: 'lecturer',
      action: 'lab_admin_destroy_all',
      resource_type: 'lab_environment',
      details: { destroyed: count },
    });
    res.json({ success: true, destroyed: count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/labs/admin/stats — Resource usage + session analytics
router.get('/admin/stats', labAdminOnly, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await labManager.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/labs/admin/sessions — Session history
router.get('/admin/sessions', labAdminOnly, (_req: AuthenticatedRequest, res: Response) => {
  const sessions = db.prepare(`
    SELECT ls.*, s.full_name as student_name
    FROM lab_sessions ls
    LEFT JOIN students s ON s.student_id = ls.student_id
    ORDER BY ls.created_at DESC
    LIMIT 100
  `).all();
  res.json(sessions);
});

export default router;
