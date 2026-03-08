import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, studentOnly, AuthenticatedRequest } from '../auth';
import { logger } from '../services/logger';

const router = Router();

router.use(authMiddleware);
router.use(studentOnly);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-() ]{6,20}$/;

// GET /api/student/profile
router.get('/profile', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const student = db.prepare(
      `SELECT student_id, full_name, email, phone, address, birth_date, gender,
              program_studi, semester, angkatan, course_id, created_at
       FROM students WHERE student_id = ?`
    ).get(req.user!.id) as Record<string, unknown> | undefined;

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    res.json({ profile: student });
  } catch (error) {
    logger.error('Get student profile error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/student/profile
router.put('/profile', (req: AuthenticatedRequest, res: Response): void => {
  const { full_name, email, phone, address, birth_date, gender, program_studi, semester, angkatan } = req.body;

  // Validate
  if (full_name !== undefined && (typeof full_name !== 'string' || full_name.trim().length === 0 || full_name.length > 200)) {
    res.status(400).json({ error: 'Nama tidak valid (1-200 karakter)' });
    return;
  }
  if (email !== undefined && email !== '' && !EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: 'Format email tidak valid' });
    return;
  }
  if (phone !== undefined && phone !== '' && !PHONE_REGEX.test(phone)) {
    res.status(400).json({ error: 'Format telepon tidak valid' });
    return;
  }
  if (gender !== undefined && gender !== '' && gender !== null && !['male', 'female'].includes(gender)) {
    res.status(400).json({ error: 'Gender harus male atau female' });
    return;
  }
  if (semester !== undefined && semester !== null && (typeof semester !== 'number' || semester < 1 || semester > 14)) {
    res.status(400).json({ error: 'Semester harus 1-14' });
    return;
  }

  try {
    const fields: string[] = [];
    const values: unknown[] = [];

    const allowedFields = ['full_name', 'email', 'phone', 'address', 'birth_date', 'gender', 'program_studi', 'semester', 'angkatan'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(req.body[field] === '' ? null : req.body[field]);
      }
    }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(req.user!.id);
    db.prepare(`UPDATE students SET ${fields.join(', ')} WHERE student_id = ?`).run(...values);

    res.json({ success: true });
  } catch (error) {
    logger.error('Update student profile error', { error: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
