import { Router, Request, Response } from 'express';
import db from '../db';
import {
  generateToken,
  verifyPassword,
  hashPassword,
  authMiddleware,
  AuthenticatedRequest,
  revokeToken,
  AUTH_COOKIE_NAME,
} from '../auth';
import { encryptData, safeDecrypt } from '../crypto';
import { setCsrfCookie } from '../middleware/csrf';
import {
  extractFaceDescriptor,
  compareFaces,
  isModelReady,
} from '../services/face.service';
import { logAudit } from '../services/audit.service';
import crypto from 'crypto';

const router = Router();

// --- Password complexity ---
const WEAK_PASSWORDS = new Set([
  'password', 'password1', 'password123', 'admin', 'admin123', 'admin1234',
  'lecturer123', 'dosen123', 'biulms123', 'qwerty123', 'Welcome1',
  '12345678901234', 'Abcdefgh1234!', 'P@ssword123456',
]);

function isPasswordComplex(password: string): boolean {
  if (password.length < 14) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^a-zA-Z0-9]/.test(password)) return false; // require special character
  if (WEAK_PASSWORDS.has(password.toLowerCase())) return false;
  return true;
}

// --- Photo validation: check JPEG magic bytes ---
function isValidJpegBase64(photo: string): boolean {
  // Accept data:image/jpeg;base64,... format
  let base64Data = photo;
  const dataUrlPrefix = 'data:image/jpeg;base64,';
  if (photo.startsWith(dataUrlPrefix)) {
    base64Data = photo.slice(dataUrlPrefix.length);
  } else if (photo.startsWith('data:image/')) {
    // Accept other image formats too (png, webp) but verify their magic bytes
    const commaIdx = photo.indexOf(',');
    if (commaIdx < 0) return false;
    base64Data = photo.slice(commaIdx + 1);
  }

  try {
    const buf = Buffer.from(base64Data, 'base64');
    if (buf.length < 4) return false;
    // JPEG: FF D8 FF
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true;
    // PNG: 89 50 4E 47
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true;
    // WebP: RIFF...WEBP
    if (buf.length >= 12 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
        buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return true;
    return false;
  } catch {
    return false;
  }
}

// --- httpOnly cookie helper ---
function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
}

// --- Persistent Rate Limiting (SQLite-backed) ---

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10;

function checkRateLimit(key: string): boolean {
  const now = new Date().toISOString();
  const entry = db.prepare('SELECT count, reset_at FROM rate_limits WHERE key = ?').get(key) as { count: number; reset_at: string } | undefined;

  if (!entry || new Date(entry.reset_at).getTime() <= Date.now()) {
    const resetAt = new Date(Date.now() + RATE_LIMIT_WINDOW_MS).toISOString();
    db.prepare('INSERT OR REPLACE INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)').run(key, resetAt);
    return true;
  }

  const newCount = entry.count + 1;
  db.prepare('UPDATE rate_limits SET count = ? WHERE key = ?').run(newCount, key);
  return newCount <= RATE_LIMIT_MAX;
}

// Cleanup expired rate limits periodically
setInterval(() => {
  try {
    db.prepare("DELETE FROM rate_limits WHERE reset_at < datetime('now')").run();
  } catch {}
}, 5 * 60 * 1000);

// --- Input Validation ---

const STUDENT_ID_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;
const MAX_STRING_LENGTH = 10000;
const MAX_PHOTO_LENGTH = 10 * 1024 * 1024; // 10MB

function sanitizeString(input: unknown, maxLength: number = MAX_STRING_LENGTH): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  return trimmed;
}

// --- Persistent Account Lockout (SQLite-backed) ---

const MAX_FAILURES = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function isAccountLocked(username: string): boolean {
  const entry = db.prepare('SELECT failures, locked_until FROM account_lockouts WHERE username = ?').get(username) as { failures: number; locked_until: string | null } | undefined;
  if (!entry || !entry.locked_until) return false;
  if (new Date(entry.locked_until).getTime() > Date.now()) return true;
  // Lockout expired, reset
  db.prepare('DELETE FROM account_lockouts WHERE username = ?').run(username);
  return false;
}

function recordFailedLogin(username: string): void {
  const entry = db.prepare('SELECT failures FROM account_lockouts WHERE username = ?').get(username) as { failures: number } | undefined;
  const newFailures = (entry?.failures ?? 0) + 1;
  const lockedUntil = newFailures >= MAX_FAILURES ? new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString() : null;
  db.prepare('INSERT OR REPLACE INTO account_lockouts (username, failures, locked_until) VALUES (?, ?, ?)').run(username, newFailures, lockedUntil);
}

function resetFailedLogins(username: string): void {
  db.prepare('DELETE FROM account_lockouts WHERE username = ?').run(username);
}

// --- Routes ---

// GET /api/auth/csrf — public endpoint to issue CSRF cookie before login
router.get('/csrf', (_req: Request, res: Response): void => {
  setCsrfCookie(res);
  res.json({ ok: true });
});

// POST /api/auth/student-login
router.post('/student-login', async (req: Request, res: Response): Promise<void> => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    return;
  }

  const studentId = sanitizeString(req.body.studentId, 50);
  if (!studentId || !STUDENT_ID_REGEX.test(studentId)) {
    res.status(400).json({ error: 'Invalid student ID format. Use alphanumeric characters, hyphens, or underscores (max 50 chars).' });
    return;
  }

  // Per-student rate limit
  if (!checkRateLimit(`student:${studentId}`)) {
    res.status(429).json({ error: 'Too many login attempts for this student ID. Try again later.' });
    return;
  }

  const photo = typeof req.body.photo === 'string' ? req.body.photo.trim() : null;
  if (photo && photo.length > MAX_PHOTO_LENGTH) {
    res.status(400).json({ error: 'Photo data too large (max 10MB).' });
    return;
  }

  // Validate photo is an actual image
  if (photo && !isValidJpegBase64(photo)) {
    res.status(400).json({ error: 'Invalid photo format. Must be JPEG, PNG, or WebP image.' });
    return;
  }

  try {
    // Check enrollment
    const existingStudent = db.prepare('SELECT student_id, is_enrolled FROM students WHERE student_id = ?')
      .get(studentId) as { student_id: string; is_enrolled: number } | undefined;

    if (existingStudent && !existingStudent.is_enrolled) {
      res.status(403).json({ error: 'Student not enrolled. Contact your lecturer for enrollment.' });
      return;
    }

    // Encrypt photo before storage
    const encryptedPhoto = photo ? encryptData(photo) : null;

    const courseId = req.body.course_id === 'crypto' ? 'crypto' : 'infosec';

    if (existingStudent) {
      if (encryptedPhoto) {
        db.prepare('UPDATE students SET photo = ?, course_id = ? WHERE student_id = ?').run(encryptedPhoto, courseId, studentId);
      } else {
        db.prepare('UPDATE students SET course_id = ? WHERE student_id = ?').run(courseId, studentId);
      }
    } else {
      // Auto-create student record (not enrolled by default — lecturer must enroll)
      db.prepare('INSERT INTO students (student_id, photo, is_enrolled, course_id) VALUES (?, ?, 0, ?)').run(studentId, encryptedPhoto, courseId);
      res.status(403).json({ error: 'Student not enrolled. Contact your lecturer for enrollment.' });
      return;
    }

    // --- Face verification for registered students ---
    const faceStatus = db.prepare(
      'SELECT is_face_registered FROM students WHERE student_id = ?',
    ).get(studentId) as { is_face_registered: number } | undefined;

    // Allow skipping face verify right after registration (student just registered face in this session)
    const skipFaceVerify = req.body.skip_face_verify === true;

    if (faceStatus?.is_face_registered && photo && isModelReady() && !skipFaceVerify) {
      const attemptNumber = Number(req.body.attempt_number) || 1;

      // Get stored descriptors
      const descriptorRows = db.prepare(
        'SELECT descriptor FROM face_descriptors WHERE student_id = ?',
      ).all(studentId) as { descriptor: string }[];

      if (descriptorRows.length > 0) {
        try {
          const queryResult = await extractFaceDescriptor(photo);
          const storedDescriptors = descriptorRows.map(r => JSON.parse(r.descriptor) as number[]);
          const { minDistance, matched, marginal } = compareFaces(queryResult.descriptor, storedDescriptors);

          // Log the attempt
          db.prepare(
            'INSERT INTO face_verification_logs (student_id, distance, matched, attempt_number) VALUES (?, ?, ?, ?)',
          ).run(studentId, minDistance, matched ? 1 : 0, attemptNumber);

          if (!matched) {
            if (attemptNumber >= 3) {
              res.status(403).json({
                error: 'Verifikasi gagal setelah 3 percobaan. Hubungi dosen untuk reset.',
                face_mismatch: true,
                max_attempts_reached: true,
              });
              return;
            }
            const msg = marginal
              ? 'Wajah kurang cocok, coba lagi dengan pencahayaan yang lebih baik.'
              : 'Wajah tidak cocok. Pastikan pencahayaan cukup dan coba lagi.';
            res.status(403).json({ error: msg, face_mismatch: true });
            return;
          }
        } catch (err: any) {
          const code = err.message;
          const messages: Record<string, string> = {
            NO_FACE_DETECTED: 'Wajah tidak terdeteksi. Pastikan wajah terlihat jelas.',
            MULTIPLE_FACES_DETECTED: 'Terdeteksi lebih dari satu wajah.',
            LOW_CONFIDENCE: 'Wajah kurang jelas. Perbaiki pencahayaan.',
          };
          res.status(400).json({ error: messages[code] || 'Gagal memproses foto wajah.', face_error: true });
          return;
        }
      }
    }

    // Create login session (store encrypted photo)
    db.prepare('INSERT INTO login_sessions (student_id, photo) VALUES (?, ?)').run(studentId, encryptedPhoto);

    const sessionId = crypto.randomBytes(16).toString('hex');
    const token = generateToken(studentId, 'student', courseId);

    // Set httpOnly cookie
    setAuthCookie(res, token);

    // Audit log
    logAudit({
      user_id: studentId,
      user_type: 'student',
      session_id: sessionId,
      action: 'login_success',
      resource_type: 'session',
      ip_address: clientIp,
      user_agent: req.headers['user-agent'] || '',
    });

    res.json({
      token,
      session_id: sessionId,
      user: {
        id: studentId,
        role: 'student',
        course: courseId,
        is_face_registered: !!(faceStatus?.is_face_registered),
      },
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/lecturer-login
router.post('/lecturer-login', (req: Request, res: Response): void => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    return;
  }

  const username = sanitizeString(req.body.username, 50);
  const password = sanitizeString(req.body.password, 200);

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  if (isAccountLocked(username)) {
    res.status(429).json({ error: 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.' });
    return;
  }

  try {
    const lecturer = db.prepare(
      'SELECT id, username, password_hash, salt, display_name, password_changed_at FROM lecturers WHERE username = ?'
    ).get(username) as { id: number; username: string; password_hash: string; salt: string; display_name: string; password_changed_at: string | null } | undefined;

    if (!lecturer) {
      recordFailedLogin(username);
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    if (!verifyPassword(password, lecturer.password_hash, lecturer.salt)) {
      recordFailedLogin(username);
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    resetFailedLogins(username);

    // Load permissions
    let permissions: string[] = [];
    try {
      const perms = db.prepare(`
        SELECT DISTINCT p.name FROM permissions p
        INNER JOIN role_permissions rp ON rp.permission_id = p.id
        INNER JOIN user_roles ur ON ur.role_id = rp.role_id
        WHERE ur.user_id = ? AND ur.user_type = 'lecturer'
      `).all(String(lecturer.id)) as { name: string }[];
      permissions = perms.map(p => p.name);
    } catch (err) {
      console.warn('[auth] Failed to load permissions:', err);
    }

    const sessionId = crypto.randomBytes(16).toString('hex');
    const token = generateToken(String(lecturer.id), 'lecturer');

    // Set httpOnly cookie
    setAuthCookie(res, token);

    const mustChangePassword = !lecturer.password_changed_at;

    // Audit log
    logAudit({
      user_id: String(lecturer.id),
      user_type: 'lecturer',
      session_id: sessionId,
      action: 'login_success',
      resource_type: 'session',
      ip_address: clientIp,
      user_agent: req.headers['user-agent'] || '',
    });

    res.json({
      token,
      session_id: sessionId,
      must_change_password: mustChangePassword,
      user: {
        id: String(lecturer.id),
        role: 'lecturer',
        displayName: lecturer.display_name,
        username: lecturer.username,
        permissions,
        tenant_id: 1,
      },
    });
  } catch (error) {
    console.error('Lecturer login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Set CSRF cookie on this entry-point GET request
  setCsrfCookie(res);

  try {
    if (req.user.role === 'student') {
      const student = db.prepare('SELECT student_id, photo, created_at FROM students WHERE student_id = ?')
        .get(req.user.id) as { student_id: string; photo: string | null; created_at: string } | undefined;

      if (!student) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      res.json({
        user: {
          id: student.student_id,
          role: 'student',
          photo: safeDecrypt(student.photo),
          createdAt: student.created_at,
          course: req.user!.course ?? 'infosec',
        },
      });
    } else {
      const lecturer = db.prepare('SELECT id, username, display_name, password_changed_at, created_at FROM lecturers WHERE id = ?')
        .get(Number(req.user.id)) as { id: number; username: string; display_name: string; password_changed_at: string | null; created_at: string } | undefined;

      if (!lecturer) {
        res.status(404).json({ error: 'Lecturer not found' });
        return;
      }

      // Load permissions
      let permissions: string[] = [];
      try {
        const perms = db.prepare(`
          SELECT DISTINCT p.name FROM permissions p
          INNER JOIN role_permissions rp ON rp.permission_id = p.id
          INNER JOIN user_roles ur ON ur.role_id = rp.role_id
          WHERE ur.user_id = ? AND ur.user_type = 'lecturer'
        `).all(String(lecturer.id)) as { name: string }[];
        permissions = perms.map(p => p.name);
      } catch {}

      res.json({
        user: {
          id: String(lecturer.id),
          role: 'lecturer',
          username: lecturer.username,
          displayName: lecturer.display_name,
          createdAt: lecturer.created_at,
          must_change_password: !lecturer.password_changed_at,
          permissions,
          tenant_id: 1,
        },
      });
    }
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/change-password (lecturer only)
router.post('/change-password', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'lecturer') {
    res.status(403).json({ error: 'Lecturer access required.' });
    return;
  }

  const currentPassword = typeof req.body.currentPassword === 'string' ? req.body.currentPassword : '';
  const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword : '';

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current and new passwords are required.' });
    return;
  }

  if (!isPasswordComplex(newPassword)) {
    res.status(400).json({ error: 'New password must be at least 14 characters with uppercase, lowercase, a number, and a special character.' });
    return;
  }

  try {
    const lecturer = db.prepare('SELECT password_hash, salt FROM lecturers WHERE id = ?')
      .get(Number(req.user.id)) as { password_hash: string; salt: string } | undefined;

    if (!lecturer || !verifyPassword(currentPassword, lecturer.password_hash, lecturer.salt)) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }

    const { hash, salt } = hashPassword(newPassword);
    db.prepare('UPDATE lecturers SET password_hash = ?, salt = ?, password_changed_at = datetime(\'now\'), tokens_invalidated_at = datetime(\'now\') WHERE id = ?')
      .run(hash, salt, Number(req.user.id));

    // Revoke the current token so user must re-login with new password
    const rawToken = (req as any)._rawToken;
    if (rawToken) {
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      revokeToken(rawToken, expiry);
    }

    // Clear auth cookie
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.json({ success: true, session_invalidated: true });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/enroll-student (lecturer only)
router.post('/enroll-student', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'lecturer') {
    res.status(403).json({ error: 'Lecturer access required.' });
    return;
  }

  const studentId = sanitizeString(req.body.studentId, 50);
  if (!studentId || !STUDENT_ID_REGEX.test(studentId)) {
    res.status(400).json({ error: 'Invalid student ID format.' });
    return;
  }

  try {
    const existing = db.prepare('SELECT student_id FROM students WHERE student_id = ?').get(studentId);
    if (existing) {
      db.prepare('UPDATE students SET is_enrolled = 1 WHERE student_id = ?').run(studentId);
    } else {
      db.prepare('INSERT INTO students (student_id, is_enrolled) VALUES (?, 1)').run(studentId);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/unenroll-student (lecturer only)
router.post('/unenroll-student', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'lecturer') {
    res.status(403).json({ error: 'Lecturer access required.' });
    return;
  }

  const studentId = sanitizeString(req.body.studentId, 50);
  if (!studentId || !STUDENT_ID_REGEX.test(studentId)) {
    res.status(400).json({ error: 'Invalid student ID format.' });
    return;
  }

  try {
    db.prepare('UPDATE students SET is_enrolled = 0 WHERE student_id = ?').run(studentId);
    res.json({ success: true });
  } catch (error) {
    console.error('Unenroll student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  // Audit log
  logAudit({
    user_id: req.user?.id,
    user_type: req.user?.role,
    action: 'logout',
    resource_type: 'session',
    ip_address: req.ip || req.socket.remoteAddress || 'unknown',
    user_agent: req.headers['user-agent'] || '',
  });

  // Revoke the token so it can't be reused
  const rawToken = (req as any)._rawToken;
  if (rawToken) {
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    revokeToken(rawToken, expiry);
  }

  clearAuthCookie(res);
  res.json({ success: true });
});

export default router;
