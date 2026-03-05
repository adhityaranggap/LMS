import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, lecturerOnly, AuthenticatedRequest } from '../auth';
import { safeDecrypt } from '../crypto';
import { logAudit } from '../services/audit.service';

const router = Router();

// Apply auth + lecturer-only middleware to all routes
router.use(authMiddleware);
router.use(lecturerOnly);

// --- Input Validation Helpers ---

const STUDENT_ID_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;

function validateGrade(grade: unknown): number | null {
  const g = Number(grade);
  if (!Number.isInteger(g) || g < 0 || g > 100) return null;
  return g;
}

function sanitizeString(input: unknown, maxLength: number = 10000): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  return trimmed;
}

// --- Routes ---

// GET /api/lecturer/students
router.get('/students', (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const students = db.prepare(`
      SELECT
        s.student_id,
        s.photo,
        s.created_at,
        (SELECT MAX(ls.login_time) FROM login_sessions ls WHERE ls.student_id = s.student_id) as last_login,
        (SELECT COUNT(DISTINCT mv.module_id) FROM module_visits mv WHERE mv.student_id = s.student_id) as modules_visited,
        (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.student_id = s.student_id) as quiz_attempts,
        (SELECT ROUND(AVG(qa2.score), 1) FROM quiz_attempts qa2 WHERE qa2.student_id = s.student_id AND qa2.score IS NOT NULL) as avg_score
      FROM students s
      ORDER BY s.created_at DESC
      LIMIT 500
    `).all() as {
      student_id: string;
      photo: string | null;
      created_at: string;
      last_login: string | null;
      modules_visited: number;
      quiz_attempts: number;
      avg_score: number | null;
    }[];

    // Decrypt photos
    const decryptedStudents = students.map(s => ({
      ...s,
      photo: safeDecrypt(s.photo),
    }));

    res.json({ students: decryptedStudents });
  } catch (error) {
    console.error('Students list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/lecturer/students/:studentId
router.get('/students/:studentId', (req: AuthenticatedRequest, res: Response): void => {
  const studentId = req.params.studentId;
  if (!STUDENT_ID_REGEX.test(studentId)) {
    res.status(400).json({ error: 'Invalid student ID format.' });
    return;
  }

  try {
    const student = db.prepare(
      'SELECT student_id, photo, created_at FROM students WHERE student_id = ?'
    ).get(studentId) as { student_id: string; photo: string | null; created_at: string } | undefined;

    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    // Login history
    const logins = db.prepare(
      'SELECT login_time, photo FROM login_sessions WHERE student_id = ? ORDER BY login_time DESC LIMIT 20'
    ).all(studentId);

    // Module visits
    const visits = db.prepare(
      'SELECT DISTINCT module_id, tab FROM module_visits WHERE student_id = ? LIMIT 100'
    ).all(studentId);

    // Lab step completions
    const labSteps = db.prepare(
      'SELECT module_id, step_index, completed_at FROM lab_step_completions WHERE student_id = ? LIMIT 100'
    ).all(studentId);

    // Lab submissions
    const labSubs = db.prepare(
      'SELECT module_id, file_name, notes, submitted_at FROM lab_submissions WHERE student_id = ? ORDER BY submitted_at DESC LIMIT 100'
    ).all(studentId);

    // Case study submissions
    const caseSubs = db.prepare(
      'SELECT module_id, answers, submitted_at FROM case_study_submissions WHERE student_id = ? ORDER BY submitted_at DESC LIMIT 100'
    ).all(studentId);

    // Quiz attempts with essay grades
    const quizAttempts = db.prepare(
      'SELECT id, module_id, answers, score, mc_correct, mc_total, submitted_at FROM quiz_attempts WHERE student_id = ? ORDER BY submitted_at DESC LIMIT 100'
    ).all(studentId) as {
      id: number;
      module_id: number;
      answers: string;
      score: number | null;
      mc_correct: number;
      mc_total: number;
      submitted_at: string;
    }[];

    const attemptsWithGrades = quizAttempts.map((attempt) => {
      const grades = db.prepare(
        'SELECT question_id, grade, feedback, graded_by, graded_at FROM essay_grades WHERE quiz_attempt_id = ?'
      ).all(attempt.id);

      let parsedAnswers: Record<string, string>;
      try {
        parsedAnswers = JSON.parse(attempt.answers);
      } catch {
        parsedAnswers = {};
      }

      return {
        ...attempt,
        answers: parsedAnswers,
        essayGrades: grades,
      };
    });

    // Decrypt photos
    const decryptedStudent = { ...student, photo: safeDecrypt(student.photo) };
    const decryptedLogins = (logins as { login_time: string; photo: string | null }[]).map(l => ({
      ...l,
      photo: safeDecrypt(l.photo),
    }));

    res.json({
      student: decryptedStudent,
      logins: decryptedLogins,
      visits,
      labSteps,
      labSubmissions: labSubs,
      caseSubmissions: caseSubs,
      quizAttempts: attemptsWithGrades,
    });
  } catch (error) {
    console.error('Student detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/lecturer/modules/stats
router.get('/modules/stats', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const courseFilter = req.query.course as string | undefined;
    const stats = [];

    const infosecIds = Array.from({ length: 16 }, (_, i) => i + 1);
    const cryptoIds = Array.from({ length: 5 }, (_, i) => i + 101);
    let moduleIds: number[];
    if (courseFilter === 'crypto') {
      moduleIds = cryptoIds;
    } else if (courseFilter === 'infosec') {
      moduleIds = infosecIds;
    } else {
      moduleIds = [...infosecIds, ...cryptoIds];
    }

    for (const moduleId of moduleIds) {
      const course = moduleId >= 101 ? 'crypto' : 'infosec';

      const visitCount = db.prepare(
        'SELECT COUNT(DISTINCT student_id) as count FROM module_visits WHERE module_id = ?'
      ).get(moduleId) as { count: number };

      const labSubCount = db.prepare(
        'SELECT COUNT(DISTINCT student_id) as count FROM lab_submissions WHERE module_id = ?'
      ).get(moduleId) as { count: number };

      const caseSubCount = db.prepare(
        'SELECT COUNT(DISTINCT student_id) as count FROM case_study_submissions WHERE module_id = ?'
      ).get(moduleId) as { count: number };

      const quizStats = db.prepare(
        'SELECT COUNT(DISTINCT student_id) as students, COUNT(*) as attempts, ROUND(AVG(score), 1) as avg_score FROM quiz_attempts WHERE module_id = ? AND score IS NOT NULL'
      ).get(moduleId) as { students: number; attempts: number; avg_score: number | null };

      stats.push({
        moduleId,
        course,
        studentsVisited: visitCount.count,
        labSubmissions: labSubCount.count,
        caseSubmissions: caseSubCount.count,
        quizStudents: quizStats.students,
        quizAttempts: quizStats.attempts,
        quizAvgScore: quizStats.avg_score,
      });
    }

    res.json({ stats });
  } catch (error) {
    console.error('Module stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/lecturer/login-history
router.get('/login-history', (req: AuthenticatedRequest, res: Response): void => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  try {
    const logins = db.prepare(
      'SELECT ls.id, ls.student_id, ls.photo, ls.login_time FROM login_sessions ls ORDER BY ls.login_time DESC LIMIT ? OFFSET ?'
    ).all(limit, offset) as { id: number; student_id: string; photo: string | null; login_time: string }[];

    const total = db.prepare('SELECT COUNT(*) as count FROM login_sessions').get() as { count: number };

    const decryptedLogins = logins.map(l => ({ ...l, photo: safeDecrypt(l.photo) }));
    res.json({ logins: decryptedLogins, total: total.count });
  } catch (error) {
    console.error('Login history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/lecturer/grade-essay
router.post('/grade-essay', (req: AuthenticatedRequest, res: Response): void => {
  const quizAttemptId = Number(req.body.quizAttemptId);
  const questionId = Number(req.body.questionId);
  const grade = validateGrade(req.body.grade);
  const feedback = sanitizeString(req.body.feedback);

  if (!Number.isInteger(quizAttemptId) || quizAttemptId <= 0) {
    res.status(400).json({ error: 'Invalid quizAttemptId.' });
    return;
  }
  if (!Number.isInteger(questionId) || questionId <= 0) {
    res.status(400).json({ error: 'Invalid questionId.' });
    return;
  }
  if (grade === null) {
    res.status(400).json({ error: 'Invalid grade. Must be integer 0-100.' });
    return;
  }

  // Verify the quiz attempt exists
  const attempt = db.prepare('SELECT id FROM quiz_attempts WHERE id = ?').get(quizAttemptId);
  if (!attempt) {
    res.status(404).json({ error: 'Quiz attempt not found.' });
    return;
  }

  try {
    // Get lecturer display name for graded_by
    const lecturer = db.prepare(
      'SELECT display_name FROM lecturers WHERE id = ?'
    ).get(Number(req.user!.id)) as { display_name: string } | undefined;

    const gradedBy = lecturer?.display_name || `Lecturer #${req.user!.id}`;

    db.prepare(`
      INSERT INTO essay_grades (quiz_attempt_id, question_id, grade, feedback, graded_by)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(quiz_attempt_id, question_id) DO UPDATE SET
        grade = excluded.grade,
        feedback = excluded.feedback,
        graded_by = excluded.graded_by,
        graded_at = datetime('now')
    `).run(quizAttemptId, questionId, grade, feedback, gradedBy);

    res.json({ success: true });
  } catch (error) {
    console.error('Grade essay error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/lecturer/dashboard-stats
router.get('/dashboard-stats', (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };

    const activeToday = db.prepare(
      "SELECT COUNT(DISTINCT student_id) as count FROM login_sessions WHERE date(login_time) = date('now')"
    ).get() as { count: number };

    const avgScores = db.prepare(
      'SELECT ROUND(AVG(score), 1) as avg FROM quiz_attempts WHERE score IS NOT NULL'
    ).get() as { avg: number | null };

    const totalQuizAttempts = db.prepare(
      'SELECT COUNT(*) as count FROM quiz_attempts'
    ).get() as { count: number };

    const totalLabSubmissions = db.prepare(
      'SELECT COUNT(*) as count FROM lab_submissions'
    ).get() as { count: number };

    const totalCaseSubmissions = db.prepare(
      'SELECT COUNT(*) as count FROM case_study_submissions'
    ).get() as { count: number };

    const ungradedEssays = db.prepare(`
      SELECT COUNT(*) as count FROM quiz_attempts qa
      WHERE qa.id NOT IN (
        SELECT DISTINCT quiz_attempt_id FROM essay_grades
      )
      AND qa.mc_total < (
        SELECT COUNT(*) FROM json_each(qa.answers)
      )
    `).get() as { count: number };

    res.json({
      totalStudents: totalStudents.count,
      activeToday: activeToday.count,
      avgQuizScore: avgScores.avg,
      totalQuizAttempts: totalQuizAttempts.count,
      totalLabSubmissions: totalLabSubmissions.count,
      totalCaseSubmissions: totalCaseSubmissions.count,
      ungradedEssays: ungradedEssays.count,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/lecturer/face-status
router.get('/face-status', (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const students = db.prepare(`
      SELECT
        s.student_id,
        s.is_face_registered,
        s.created_at,
        (SELECT MAX(fd.created_at) FROM face_descriptors fd WHERE fd.student_id = s.student_id) as face_registered_at,
        (SELECT COUNT(*) FROM face_descriptors fd2 WHERE fd2.student_id = s.student_id) as descriptor_count
      FROM students s
      ORDER BY s.created_at DESC
      LIMIT 500
    `).all() as {
      student_id: string;
      is_face_registered: number;
      created_at: string;
      face_registered_at: string | null;
      descriptor_count: number;
    }[];

    res.json({ students });
  } catch (error) {
    console.error('Face status list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/lecturer/face-mismatches
router.get('/face-mismatches', (req: AuthenticatedRequest, res: Response): void => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);

  try {
    const logs = db.prepare(`
      SELECT student_id, distance, matched, attempt_number, created_at
      FROM face_verification_logs
      WHERE matched = 0
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit) as {
      student_id: string;
      distance: number;
      matched: number;
      attempt_number: number;
      created_at: string;
    }[];

    res.json({ logs });
  } catch (error) {
    console.error('Face mismatches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/lecturer/face-reset/:studentId
router.post('/face-reset/:studentId', (req: AuthenticatedRequest, res: Response): void => {
  const { studentId } = req.params;
  if (!STUDENT_ID_REGEX.test(studentId)) {
    res.status(400).json({ error: 'Invalid student ID format.' });
    return;
  }

  try {
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM face_descriptors WHERE student_id = ?').run(studentId);
      db.prepare('UPDATE students SET is_face_registered = 0 WHERE student_id = ?').run(studentId);
    });
    transaction();

    res.json({ success: true });
  } catch (error) {
    console.error('Face reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Fraud Flags ---

// GET /api/lecturer/fraud-flags
router.get('/fraud-flags', (req: AuthenticatedRequest, res: Response): void => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const flagType = typeof req.query.flag_type === 'string' ? req.query.flag_type : null;
  const isReviewed = req.query.is_reviewed !== undefined ? Number(req.query.is_reviewed) : null;
  const tenantId = (req as any).tenantId ?? 1;

  try {
    let where = 'WHERE tenant_id = ?';
    const params: unknown[] = [tenantId];

    if (flagType) {
      where += ' AND flag_type = ?';
      params.push(flagType);
    }
    if (isReviewed !== null) {
      where += ' AND is_reviewed = ?';
      params.push(isReviewed);
    }

    const total = db.prepare(`SELECT COUNT(*) as count FROM fraud_flags ${where}`).get(...params) as { count: number };

    const flags = db.prepare(`
      SELECT id, user_id, flag_type, severity, resource_type, resource_id, details, is_reviewed, reviewed_by, reviewed_at, created_at
      FROM fraud_flags ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({ flags, total: total.count });
  } catch (error) {
    console.error('Fraud flags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/lecturer/fraud-flags/:id/review
router.post('/fraud-flags/:id/review', (req: AuthenticatedRequest, res: Response): void => {
  const flagId = Number(req.params.id);
  if (!Number.isInteger(flagId) || flagId <= 0) {
    res.status(400).json({ error: 'Invalid flag ID.' });
    return;
  }

  try {
    const existing = db.prepare('SELECT id FROM fraud_flags WHERE id = ?').get(flagId);
    if (!existing) {
      res.status(404).json({ error: 'Fraud flag not found.' });
      return;
    }

    const lecturer = db.prepare('SELECT display_name FROM lecturers WHERE id = ?')
      .get(Number(req.user!.id)) as { display_name: string } | undefined;

    db.prepare(`
      UPDATE fraud_flags SET is_reviewed = 1, reviewed_by = ?, reviewed_at = datetime('now')
      WHERE id = ?
    `).run(lecturer?.display_name || `Lecturer #${req.user!.id}`, flagId);

    logAudit({
      user_id: req.user!.id,
      user_type: 'lecturer',
      action: 'fraud_flag_review',
      resource_type: 'fraud_flag',
      resource_id: String(flagId),
      ip_address: req.ip || req.socket.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || '',
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Fraud flag review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/lecturer/students/:studentId/fraud-flags
router.get('/students/:studentId/fraud-flags', (req: AuthenticatedRequest, res: Response): void => {
  const { studentId } = req.params;
  if (!STUDENT_ID_REGEX.test(studentId)) {
    res.status(400).json({ error: 'Invalid student ID format.' });
    return;
  }

  try {
    const flags = db.prepare(`
      SELECT id, flag_type, severity, resource_type, resource_id, details, is_reviewed, reviewed_by, created_at
      FROM fraud_flags WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 100
    `).all(studentId);

    res.json({ flags });
  } catch (error) {
    console.error('Student fraud flags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/lecturer/students/:studentId/sessions — login sessions with device info
router.get('/students/:studentId/sessions', (req: AuthenticatedRequest, res: Response): void => {
  const { studentId } = req.params;
  if (!STUDENT_ID_REGEX.test(studentId)) {
    res.status(400).json({ error: 'Invalid student ID format.' });
    return;
  }

  try {
    const sessions = db.prepare(`
      SELECT ls.id, ls.login_time, sdi.ip_address, sdi.user_agent, sdi.screen_width, sdi.screen_height, sdi.timezone, sdi.language, sdi.platform
      FROM login_sessions ls
      LEFT JOIN session_device_info sdi ON sdi.user_id = ls.student_id
      WHERE ls.student_id = ?
      ORDER BY ls.login_time DESC LIMIT 50
    `).all(studentId);

    res.json({ sessions });
  } catch (error) {
    console.error('Student sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- AI Validation ---

// GET /api/lecturer/submissions/:type/:id/validation
router.get('/submissions/:type/:id/validation', (req: AuthenticatedRequest, res: Response): void => {
  const submissionType = req.params.type;
  const submissionId = Number(req.params.id);

  if (!['quiz', 'case_study'].includes(submissionType)) {
    res.status(400).json({ error: 'Invalid submission type.' });
    return;
  }
  if (!Number.isInteger(submissionId) || submissionId <= 0) {
    res.status(400).json({ error: 'Invalid submission ID.' });
    return;
  }

  try {
    const validations = db.prepare(`
      SELECT id, question_id, ai_detection_score, relevance_score, quality_score, plagiarism_indicators, ai_feedback, created_at
      FROM ai_validations
      WHERE submission_type = ? AND submission_id = ?
      ORDER BY question_id
    `).all(submissionType, submissionId);

    res.json({ validations });
  } catch (error) {
    console.error('AI validation fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Export ---

// GET /api/lecturer/export/students?format=csv
router.get('/export/students', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const students = db.prepare(`
      SELECT
        s.student_id,
        s.created_at,
        s.is_enrolled,
        (SELECT MAX(ls.login_time) FROM login_sessions ls WHERE ls.student_id = s.student_id) as last_login,
        (SELECT COUNT(DISTINCT mv.module_id) FROM module_visits mv WHERE mv.student_id = s.student_id) as modules_visited,
        (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.student_id = s.student_id) as quiz_attempts,
        (SELECT ROUND(AVG(qa2.score), 1) FROM quiz_attempts qa2 WHERE qa2.student_id = s.student_id AND qa2.score IS NOT NULL) as avg_score
      FROM students s
      ORDER BY s.created_at DESC
    `).all() as Record<string, unknown>[];

    const headers = ['student_id', 'created_at', 'is_enrolled', 'last_login', 'modules_visited', 'quiz_attempts', 'avg_score'];
    const csvRows = [headers.join(',')];
    for (const row of students) {
      csvRows.push(headers.map(h => String(row[h] ?? '')).join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students_export.csv"');
    res.send(csvRows.join('\n'));
  } catch (error) {
    console.error('Export students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/lecturer/export/audit-logs?from=&to=&format=csv
router.get('/export/audit-logs', (req: AuthenticatedRequest, res: Response): void => {
  const dateFrom = typeof req.query.from === 'string' ? req.query.from : null;
  const dateTo = typeof req.query.to === 'string' ? req.query.to : null;

  try {
    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (dateFrom) { where += ' AND created_at >= ?'; params.push(dateFrom); }
    if (dateTo) { where += ' AND created_at <= ?'; params.push(dateTo); }

    const logs = db.prepare(`
      SELECT id, user_id, user_type, action, resource_type, resource_id, ip_address, created_at
      FROM audit_logs ${where}
      ORDER BY created_at DESC LIMIT 10000
    `).all(...params) as Record<string, unknown>[];

    const headers = ['id', 'user_id', 'user_type', 'action', 'resource_type', 'resource_id', 'ip_address', 'created_at'];
    const csvRows = [headers.join(',')];
    for (const row of logs) {
      csvRows.push(headers.map(h => String(row[h] ?? '')).join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit_logs_export.csv"');
    res.send(csvRows.join('\n'));
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced dashboard-stats — add fraud/validation counts
router.get('/enhanced-stats', (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const unreviewedFraudFlags = db.prepare(
      'SELECT COUNT(*) as count FROM fraud_flags WHERE is_reviewed = 0'
    ).get() as { count: number };

    const highSeverityFlags = db.prepare(
      "SELECT COUNT(*) as count FROM fraud_flags WHERE is_reviewed = 0 AND severity IN ('high', 'critical')"
    ).get() as { count: number };

    const pendingAIValidations = db.prepare(
      'SELECT COUNT(*) as count FROM ai_validations WHERE ai_detection_score > 0.7'
    ).get() as { count: number };

    res.json({
      unreviewedFraudFlags: unreviewedFraudFlags.count,
      highSeverityFlags: highSeverityFlags.count,
      pendingAIValidations: pendingAIValidations.count,
    });
  } catch (error) {
    console.error('Enhanced stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
