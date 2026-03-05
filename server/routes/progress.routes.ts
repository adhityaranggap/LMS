import { Router, Request, Response, NextFunction } from 'express';
import db from '../db';
import { authMiddleware, studentOnly, AuthenticatedRequest } from '../auth';
import { syllabusData } from '../../src/data/syllabus-data';
import { cryptoSyllabusData } from '../../src/data/crypto-syllabus-data';
import { logAudit } from '../services/audit.service';
import { analyzeSubmission, AntiCheatData } from '../services/fraud.service';
import { enqueueValidation } from '../services/ai-validation.service';

const router = Router();

// Apply auth + student-only middleware to all routes
router.use(authMiddleware);
router.use(studentOnly);

// --- Rate Limiting for submission routes ---

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const progressRateLimitMap = new Map<string, RateLimitEntry>();
const PROGRESS_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const PROGRESS_RATE_LIMIT_MAX = 30;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of progressRateLimitMap) {
    if (entry.resetAt <= now) {
      progressRateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

function progressRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = progressRateLimitMap.get(ip);

  if (!entry || entry.resetAt <= now) {
    progressRateLimitMap.set(ip, { count: 1, resetAt: now + PROGRESS_RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  entry.count++;
  if (entry.count > PROGRESS_RATE_LIMIT_MAX) {
    res.status(429).json({ error: 'Too many requests. Try again later.' });
    return;
  }
  next();
}

// --- Input Validation Helpers ---

const VALID_TABS = ['theory', 'lab', 'case', 'quiz', 'videos', 'interactive'] as const;
const MAX_STRING_LENGTH = 10000;

function validateModuleId(moduleId: unknown, course?: string): number | null {
  const id = Number(moduleId);
  if (!Number.isInteger(id)) return null;
  if (course === 'crypto') {
    if (id < 101 || id > 105) return null;
  } else {
    if (id < 1 || id > 16) return null;
  }
  return id;
}

function validateTab(tab: unknown): string | null {
  if (typeof tab !== 'string') return null;
  const trimmed = tab.trim();
  if (!VALID_TABS.includes(trimmed as typeof VALID_TABS[number])) return null;
  return trimmed;
}

function validateStepIndex(stepIndex: unknown): number | null {
  const idx = Number(stepIndex);
  if (!Number.isInteger(idx) || idx < 0) return null;
  return idx;
}

function sanitizeString(input: unknown, maxLength: number = MAX_STRING_LENGTH): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  return trimmed;
}

// --- Routes ---

// POST /api/progress/visit
router.post('/visit', progressRateLimit, (req: AuthenticatedRequest, res: Response): void => {
  const moduleId = validateModuleId(req.body.moduleId, req.user?.course);
  const tab = validateTab(req.body.tab);

  if (moduleId === null) {
    res.status(400).json({ error: 'Invalid moduleId. Must be integer 1-16.' });
    return;
  }
  if (tab === null) {
    res.status(400).json({ error: 'Invalid tab. Must be one of: theory, lab, case, quiz, videos.' });
    return;
  }

  try {
    db.prepare(
      'INSERT INTO module_visits (student_id, module_id, tab) VALUES (?, ?, ?)'
    ).run(req.user!.id, moduleId, tab);

    res.json({ success: true });
  } catch (error) {
    console.error('Visit recording error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/progress/visits
router.get('/visits', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const visits = db.prepare(
      'SELECT module_id, tab, visited_at FROM module_visits WHERE student_id = ? ORDER BY visited_at DESC'
    ).all(req.user!.id);

    res.json({ visits });
  } catch (error) {
    console.error('Visits fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/progress/lab-step
router.post('/lab-step', progressRateLimit, (req: AuthenticatedRequest, res: Response): void => {
  const moduleId = validateModuleId(req.body.moduleId, req.user?.course);
  const stepIndex = validateStepIndex(req.body.stepIndex);
  const completed = req.body.completed;

  if (moduleId === null) {
    res.status(400).json({ error: 'Invalid moduleId. Must be integer 1-16.' });
    return;
  }
  if (stepIndex === null) {
    res.status(400).json({ error: 'Invalid stepIndex. Must be non-negative integer.' });
    return;
  }
  if (typeof completed !== 'boolean') {
    res.status(400).json({ error: 'completed must be a boolean.' });
    return;
  }

  try {
    if (completed) {
      db.prepare(
        'INSERT OR IGNORE INTO lab_step_completions (student_id, module_id, step_index) VALUES (?, ?, ?)'
      ).run(req.user!.id, moduleId, stepIndex);
    } else {
      db.prepare(
        'DELETE FROM lab_step_completions WHERE student_id = ? AND module_id = ? AND step_index = ?'
      ).run(req.user!.id, moduleId, stepIndex);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Lab step toggle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/progress/lab-steps/:moduleId
router.get('/lab-steps/:moduleId', (req: AuthenticatedRequest, res: Response): void => {
  const moduleId = validateModuleId(req.params.moduleId, req.user?.course);
  if (moduleId === null) {
    res.status(400).json({ error: 'Invalid moduleId. Must be integer 1-16.' });
    return;
  }

  try {
    const steps = db.prepare(
      'SELECT step_index, completed_at FROM lab_step_completions WHERE student_id = ? AND module_id = ?'
    ).all(req.user!.id, moduleId) as { step_index: number; completed_at: string }[];

    res.json({ completedSteps: steps.map((s) => s.step_index) });
  } catch (error) {
    console.error('Lab steps fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/progress/lab-submit
router.post('/lab-submit', progressRateLimit, (req: AuthenticatedRequest, res: Response): void => {
  const moduleId = validateModuleId(req.body.moduleId, req.user?.course);
  const fileName = sanitizeString(req.body.fileName, 500);
  const notes = sanitizeString(req.body.notes);

  if (moduleId === null) {
    res.status(400).json({ error: 'Invalid moduleId. Must be integer 1-16.' });
    return;
  }

  try {
    const result = db.prepare(
      'INSERT INTO lab_submissions (student_id, module_id, file_name, notes) VALUES (?, ?, ?, ?)'
    ).run(req.user!.id, moduleId, fileName, notes);

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Lab submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/progress/case-submit
router.post('/case-submit', progressRateLimit, (req: AuthenticatedRequest, res: Response): void => {
  const moduleId = validateModuleId(req.body.moduleId, req.user?.course);

  if (moduleId === null) {
    res.status(400).json({ error: 'Invalid moduleId. Must be integer 1-16.' });
    return;
  }

  const rawAnswers = req.body.answers;
  let answersStr: string;
  if (typeof rawAnswers === 'string') {
    // Already JSON-stringified by the client
    if (rawAnswers.length > MAX_STRING_LENGTH * 10) {
      res.status(400).json({ error: 'Answers data too large.' });
      return;
    }
    answersStr = rawAnswers;
  } else if (typeof rawAnswers === 'object' && rawAnswers !== null) {
    answersStr = JSON.stringify(rawAnswers);
  } else {
    res.status(400).json({ error: 'answers is required.' });
    return;
  }

  try {
    const result = db.prepare(
      'INSERT INTO case_study_submissions (student_id, module_id, answers) VALUES (?, ?, ?)'
    ).run(req.user!.id, moduleId, answersStr);

    const submissionId = Number(result.lastInsertRowid);

    // Audit log
    logAudit({
      user_id: req.user!.id,
      user_type: 'student',
      action: 'case_submit',
      resource_type: 'case_study_submission',
      resource_id: String(submissionId),
      details: { moduleId },
      ip_address: req.ip || req.socket.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || '',
    });

    // Anti-fraud analysis
    const antiCheatData = req.body.antiCheatData as AntiCheatData | undefined;
    analyzeSubmission(req.user!.id, 'case_study', submissionId, antiCheatData);

    // AI validation for case study answers
    const allModules = [...syllabusData, ...cryptoSyllabusData];
    const moduleData = allModules.find((m) => m.id === moduleId);
    if (moduleData?.caseStudy?.questions) {
      let parsedAnswers: Record<string, string>;
      try {
        parsedAnswers = typeof rawAnswers === 'string' ? JSON.parse(rawAnswers) : rawAnswers;
      } catch {
        parsedAnswers = {};
      }

      for (let i = 0; i < moduleData.caseStudy.questions.length; i++) {
        const q = moduleData.caseStudy.questions[i];
        const studentAnswer = parsedAnswers[String(i)];
        if (studentAnswer && studentAnswer.trim().length > 0) {
          enqueueValidation({
            submission_type: 'case_study',
            submission_id: submissionId,
            question_id: i,
            student_id: req.user!.id,
            module_id: moduleId,
            question: q,
            referenceAnswer: '',
            studentAnswer,
          });
        }
      }
    }

    res.json({ success: true, id: submissionId });
  } catch (error) {
    console.error('Case study submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/progress/case-submission/:moduleId
router.get('/case-submission/:moduleId', (req: AuthenticatedRequest, res: Response): void => {
  const moduleId = validateModuleId(req.params.moduleId, req.user?.course);
  if (moduleId === null) {
    res.status(400).json({ error: 'Invalid moduleId. Must be integer 1-16.' });
    return;
  }

  try {
    const submission = db.prepare(
      'SELECT id, answers, submitted_at FROM case_study_submissions WHERE student_id = ? AND module_id = ? ORDER BY submitted_at DESC LIMIT 1'
    ).get(req.user!.id, moduleId) as { id: number; answers: string; submitted_at: string } | undefined;

    if (!submission) {
      res.json({ submission: null });
      return;
    }

    let parsedAnswers: unknown;
    try {
      parsedAnswers = JSON.parse(submission.answers);
    } catch {
      parsedAnswers = submission.answers;
    }

    res.json({
      submission: {
        id: submission.id,
        answers: parsedAnswers,
        submittedAt: submission.submitted_at,
      },
    });
  } catch (error) {
    console.error('Case submission fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/progress/quiz-submit
router.post('/quiz-submit', progressRateLimit, (req: AuthenticatedRequest, res: Response): void => {
  const moduleId = validateModuleId(req.body.moduleId, req.user?.course);

  if (moduleId === null) {
    res.status(400).json({ error: 'Invalid moduleId. Must be integer 1-16.' });
    return;
  }

  const rawAnswers = req.body.answers;
  let answers: Record<string, string>;
  let answersStr: string;
  if (typeof rawAnswers === 'string') {
    if (rawAnswers.length > MAX_STRING_LENGTH * 10) {
      res.status(400).json({ error: 'Answers data too large.' });
      return;
    }
    try {
      answers = JSON.parse(rawAnswers);
      answersStr = rawAnswers;
    } catch {
      res.status(400).json({ error: 'answers must be valid JSON.' });
      return;
    }
  } else if (typeof rawAnswers === 'object' && rawAnswers !== null) {
    answers = rawAnswers;
    answersStr = JSON.stringify(rawAnswers);
  } else {
    res.status(400).json({ error: 'answers is required.' });
    return;
  }

  // Auto-grade multiple-choice questions
  const allModules = [...syllabusData, ...cryptoSyllabusData];
  const moduleData = allModules.find((m) => m.id === moduleId);
  let mcCorrect = 0;
  let mcTotal = 0;
  let score: number | null = null;

  if (moduleData) {
    for (const question of moduleData.quiz) {
      if (question.type === 'multiple-choice') {
        mcTotal++;
        const studentAnswer = answers[String(question.id)];
        if (studentAnswer && studentAnswer === question.answer) {
          mcCorrect++;
        }
      }
    }

    if (mcTotal > 0) {
      score = Math.round((mcCorrect / mcTotal) * 100);
    }
  }

  try {
    const result = db.prepare(
      'INSERT INTO quiz_attempts (student_id, module_id, answers, score, mc_correct, mc_total) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user!.id, moduleId, answersStr, score, mcCorrect, mcTotal);

    const submissionId = Number(result.lastInsertRowid);

    // Audit log
    logAudit({
      user_id: req.user!.id,
      user_type: 'student',
      action: 'quiz_submit',
      resource_type: 'quiz_attempt',
      resource_id: String(submissionId),
      details: { moduleId, score, mcCorrect, mcTotal },
      ip_address: req.ip || req.socket.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || '',
    });

    // Anti-fraud analysis
    const antiCheatData = req.body.antiCheatData as AntiCheatData | undefined;
    analyzeSubmission(req.user!.id, 'quiz', submissionId, antiCheatData);

    // AI validation for essay answers
    if (moduleData) {
      for (const question of moduleData.quiz) {
        if (question.type === 'essay') {
          const studentAnswer = answers[String(question.id)];
          if (studentAnswer && studentAnswer.trim().length > 0) {
            enqueueValidation({
              submission_type: 'quiz',
              submission_id: submissionId,
              question_id: question.id,
              student_id: req.user!.id,
              module_id: moduleId,
              question: question.question,
              referenceAnswer: question.answer,
              studentAnswer,
            });
          }
        }
      }
    }

    res.json({
      success: true,
      id: submissionId,
      score,
      mcCorrect,
      mcTotal,
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/progress/quiz-attempts/:moduleId
router.get('/quiz-attempts/:moduleId', (req: AuthenticatedRequest, res: Response): void => {
  const moduleId = validateModuleId(req.params.moduleId, req.user?.course);
  if (moduleId === null) {
    res.status(400).json({ error: 'Invalid moduleId. Must be integer 1-16.' });
    return;
  }

  try {
    const attempts = db.prepare(
      'SELECT id, answers, score, mc_correct, mc_total, submitted_at FROM quiz_attempts WHERE student_id = ? AND module_id = ? ORDER BY submitted_at DESC'
    ).all(req.user!.id, moduleId) as {
      id: number;
      answers: string;
      score: number | null;
      mc_correct: number;
      mc_total: number;
      submitted_at: string;
    }[];

    // Fetch essay grades for each attempt
    const attemptsWithGrades = attempts.map((attempt) => {
      const grades = db.prepare(
        'SELECT question_id, grade, feedback, graded_by, graded_at FROM essay_grades WHERE quiz_attempt_id = ?'
      ).all(attempt.id) as {
        question_id: number;
        grade: number;
        feedback: string | null;
        graded_by: string | null;
        graded_at: string;
      }[];

      let parsedAnswers: unknown;
      try {
        parsedAnswers = JSON.parse(attempt.answers);
      } catch {
        parsedAnswers = {};
      }

      return {
        id: attempt.id,
        answers: parsedAnswers,
        score: attempt.score,
        mcCorrect: attempt.mc_correct,
        mcTotal: attempt.mc_total,
        submittedAt: attempt.submitted_at,
        essayGrades: grades,
      };
    });

    res.json({ attempts: attemptsWithGrades });
  } catch (error) {
    console.error('Quiz attempts fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/progress/summary
router.get('/summary', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const studentId = req.user!.id;

    // Get distinct visited tabs per module
    const visits = db.prepare(
      'SELECT DISTINCT module_id, tab FROM module_visits WHERE student_id = ?'
    ).all(studentId) as { module_id: number; tab: string }[];

    // Get completed lab steps per module
    const labSteps = db.prepare(
      'SELECT module_id, COUNT(*) as count FROM lab_step_completions WHERE student_id = ? GROUP BY module_id'
    ).all(studentId) as { module_id: number; count: number }[];

    // Get lab submissions per module
    const labSubs = db.prepare(
      'SELECT DISTINCT module_id FROM lab_submissions WHERE student_id = ?'
    ).all(studentId) as { module_id: number }[];

    // Get case study submissions per module
    const caseSubs = db.prepare(
      'SELECT DISTINCT module_id FROM case_study_submissions WHERE student_id = ?'
    ).all(studentId) as { module_id: number }[];

    // Get best quiz scores per module
    const quizScores = db.prepare(
      'SELECT module_id, MAX(score) as best_score, COUNT(*) as attempts FROM quiz_attempts WHERE student_id = ? GROUP BY module_id'
    ).all(studentId) as { module_id: number; best_score: number | null; attempts: number }[];

    // Build per-module summary (covers both infosec 1-16 and crypto 101-105)
    const summary: Record<number, {
      visitedTabs: string[];
      labStepsCompleted: number;
      labSubmitted: boolean;
      caseSubmitted: boolean;
      quizBestScore: number | null;
      quizAttempts: number;
    }> = {};

    const infosecIds = Array.from({ length: 16 }, (_, i) => i + 1);
    const cryptoIds = Array.from({ length: 5 }, (_, i) => i + 101);
    for (const i of [...infosecIds, ...cryptoIds]) {
      summary[i] = {
        visitedTabs: [],
        labStepsCompleted: 0,
        labSubmitted: false,
        caseSubmitted: false,
        quizBestScore: null,
        quizAttempts: 0,
      };
    }

    for (const v of visits) {
      if (summary[v.module_id]) {
        summary[v.module_id].visitedTabs.push(v.tab);
      }
    }

    for (const ls of labSteps) {
      if (summary[ls.module_id]) {
        summary[ls.module_id].labStepsCompleted = ls.count;
      }
    }

    for (const sub of labSubs) {
      if (summary[sub.module_id]) {
        summary[sub.module_id].labSubmitted = true;
      }
    }

    for (const cs of caseSubs) {
      if (summary[cs.module_id]) {
        summary[cs.module_id].caseSubmitted = true;
      }
    }

    for (const qs of quizScores) {
      if (summary[qs.module_id]) {
        summary[qs.module_id].quizBestScore = qs.best_score;
        summary[qs.module_id].quizAttempts = qs.attempts;
      }
    }

    res.json({ summary });
  } catch (error) {
    console.error('Summary fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
