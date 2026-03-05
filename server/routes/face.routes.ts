import { Router, Request, Response } from 'express';
import db from '../db';
import {
  extractFaceDescriptor,
  compareFaces,
  isModelReady,
  FACE_MATCH_THRESHOLD,
  FACE_WARN_THRESHOLD,
} from '../services/face.service';
import { authMiddleware, lecturerOnly, AuthenticatedRequest } from '../auth';

const router = Router();

const STUDENT_ID_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;
const POSE_LABELS = ['front', 'right', 'left'] as const;

function faceErrorMessage(code: string): string {
  switch (code) {
    case 'NO_FACE_DETECTED':
      return 'Wajah tidak terdeteksi. Pastikan wajah terlihat jelas.';
    case 'MULTIPLE_FACES_DETECTED':
      return 'Terdeteksi lebih dari satu wajah.';
    case 'LOW_CONFIDENCE':
      return 'Wajah kurang jelas. Perbaiki pencahayaan.';
    case 'MODEL_NOT_READY':
      return 'Layanan pengenalan wajah belum siap. Coba lagi dalam beberapa detik.';
    default:
      return 'Gagal memproses foto wajah.';
  }
}

// GET /api/face/status/:studentId
router.get('/status/:studentId', (req: Request, res: Response): void => {
  const { studentId } = req.params;
  if (!STUDENT_ID_REGEX.test(studentId)) {
    res.status(400).json({ error: 'Invalid student ID format.' });
    return;
  }

  try {
    const student = db.prepare(
      'SELECT is_face_registered, is_enrolled FROM students WHERE student_id = ?',
    ).get(studentId) as { is_face_registered: number; is_enrolled: number } | undefined;

    res.json({
      registered: !!(student && student.is_face_registered),
      enrolled: !!(student && student.is_enrolled),
    });
  } catch (error) {
    console.error('Face status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/face/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  if (!isModelReady()) {
    res.status(503).json({ error: faceErrorMessage('MODEL_NOT_READY') });
    return;
  }

  const { studentId, photos } = req.body;

  if (!studentId || !STUDENT_ID_REGEX.test(studentId)) {
    res.status(400).json({ error: 'Invalid student ID format.' });
    return;
  }

  if (!photos || typeof photos !== 'object') {
    res.status(400).json({ error: 'Photos object required with front, right, left.' });
    return;
  }

  // Check student — create stub record if first time (enrollment checked at login)
  let student = db.prepare(
    'SELECT student_id, is_face_registered FROM students WHERE student_id = ?',
  ).get(studentId) as { student_id: string; is_face_registered: number } | undefined;

  if (!student) {
    db.prepare('INSERT INTO students (student_id, is_enrolled) VALUES (?, 0)').run(studentId);
    student = { student_id: studentId, is_face_registered: 0 };
  }

  if (student.is_face_registered) {
    res.status(409).json({ error: 'Wajah sudah terdaftar.' });
    return;
  }

  // Extract descriptors for each pose
  const descriptors: { pose: string; descriptor: number[] }[] = [];

  for (const pose of POSE_LABELS) {
    const photo = photos[pose];
    if (!photo || typeof photo !== 'string') {
      res.status(400).json({ error: `Foto ${pose} diperlukan.`, pose });
      return;
    }

    try {
      const result = await extractFaceDescriptor(photo);
      descriptors.push({ pose, descriptor: result.descriptor });
    } catch (err: any) {
      res.status(400).json({
        error: faceErrorMessage(err.message),
        pose,
        code: err.message,
      });
      return;
    }
  }

  // Store descriptors in database
  try {
    const insertStmt = db.prepare(
      'INSERT INTO face_descriptors (student_id, descriptor, pose_label) VALUES (?, ?, ?)',
    );

    const transaction = db.transaction(() => {
      for (const d of descriptors) {
        insertStmt.run(studentId, JSON.stringify(d.descriptor), d.pose);
      }
      db.prepare('UPDATE students SET is_face_registered = 1, is_enrolled = 1 WHERE student_id = ?').run(studentId);
    });

    transaction();

    res.json({ success: true, message: 'Wajah berhasil didaftarkan.' });
  } catch (error) {
    console.error('Face register DB error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/face/verify
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
  if (!isModelReady()) {
    res.status(503).json({ error: faceErrorMessage('MODEL_NOT_READY') });
    return;
  }

  const { studentId, photo, attemptNumber } = req.body;

  if (!studentId || !STUDENT_ID_REGEX.test(studentId)) {
    res.status(400).json({ error: 'Invalid student ID format.' });
    return;
  }

  if (!photo || typeof photo !== 'string') {
    res.status(400).json({ error: 'Photo required.' });
    return;
  }

  const attempt = Number(attemptNumber) || 1;

  try {
    // Get stored descriptors
    const rows = db.prepare(
      'SELECT descriptor FROM face_descriptors WHERE student_id = ?',
    ).all(studentId) as { descriptor: string }[];

    if (rows.length === 0) {
      res.status(404).json({ error: 'Wajah belum terdaftar.', not_registered: true });
      return;
    }

    const storedDescriptors = rows.map((r) => JSON.parse(r.descriptor) as number[]);

    // Extract query descriptor
    let queryDescriptor: number[];
    try {
      const result = await extractFaceDescriptor(photo);
      queryDescriptor = result.descriptor;
    } catch (err: any) {
      res.status(400).json({ error: faceErrorMessage(err.message), code: err.message });
      return;
    }

    // Compare
    const { minDistance, matched, marginal } = compareFaces(queryDescriptor, storedDescriptors);

    // Log the attempt
    db.prepare(
      'INSERT INTO face_verification_logs (student_id, distance, matched, attempt_number) VALUES (?, ?, ?, ?)',
    ).run(studentId, minDistance, matched ? 1 : 0, attempt);

    if (matched) {
      res.json({ match: true, distance: Math.round(minDistance * 1000) / 1000 });
    } else if (marginal) {
      res.status(403).json({
        match: false,
        distance: Math.round(minDistance * 1000) / 1000,
        error: 'Wajah kurang cocok, coba lagi dengan pencahayaan yang lebih baik.',
        face_mismatch: true,
      });
    } else {
      if (attempt >= 3) {
        res.status(403).json({
          match: false,
          distance: Math.round(minDistance * 1000) / 1000,
          error: 'Verifikasi gagal setelah 3 percobaan. Hubungi dosen untuk reset.',
          face_mismatch: true,
          max_attempts_reached: true,
        });
      } else {
        res.status(403).json({
          match: false,
          distance: Math.round(minDistance * 1000) / 1000,
          error: 'Wajah tidak cocok. Pastikan pencahayaan cukup dan coba lagi.',
          face_mismatch: true,
        });
      }
    }
  } catch (error) {
    console.error('Face verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/face/re-register (lecturer only)
router.post(
  '/re-register',
  authMiddleware,
  lecturerOnly,
  (req: AuthenticatedRequest, res: Response): void => {
    const studentId = req.body.studentId;
    if (!studentId || !STUDENT_ID_REGEX.test(studentId)) {
      res.status(400).json({ error: 'Invalid student ID format.' });
      return;
    }

    try {
      const transaction = db.transaction(() => {
        db.prepare('DELETE FROM face_descriptors WHERE student_id = ?').run(studentId);
        db.prepare('UPDATE students SET is_face_registered = 0 WHERE student_id = ?').run(studentId);
      });
      transaction();

      res.json({ success: true, message: 'Face registration reset. Student can re-register on next login.' });
    } catch (error) {
      console.error('Face re-register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export default router;
