import Database from 'better-sqlite3';
import path from 'path';

// In production Docker: use /data volume for persistence
// In development: use project root
const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/data/data.db'
  : path.join(process.cwd(), 'data.db');

const db = new Database(DB_PATH);

// WAL mode for better concurrent reads
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS lecturers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    display_name TEXT NOT NULL,
    password_changed_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS students (
    student_id TEXT PRIMARY KEY,
    photo TEXT,
    is_enrolled INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS revoked_tokens (
    token_hash TEXT PRIMARY KEY,
    revoked_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS login_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    photo TEXT,
    login_time TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
  );

  CREATE TABLE IF NOT EXISTS module_visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    tab TEXT NOT NULL,
    visited_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
  );

  CREATE TABLE IF NOT EXISTS lab_step_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    step_index INTEGER NOT NULL,
    completed_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    UNIQUE(student_id, module_id, step_index)
  );

  CREATE TABLE IF NOT EXISTS lab_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    file_name TEXT,
    notes TEXT,
    submitted_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
  );

  CREATE TABLE IF NOT EXISTS case_study_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    answers TEXT NOT NULL,
    submitted_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
  );

  CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    answers TEXT NOT NULL,
    score INTEGER,
    mc_correct INTEGER DEFAULT 0,
    mc_total INTEGER DEFAULT 0,
    submitted_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
  );

  CREATE TABLE IF NOT EXISTS essay_grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_attempt_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    grade INTEGER CHECK(grade >= 0 AND grade <= 100),
    feedback TEXT,
    graded_by TEXT,
    graded_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (quiz_attempt_id) REFERENCES quiz_attempts(id),
    UNIQUE(quiz_attempt_id, question_id)
  );

  CREATE TABLE IF NOT EXISTS module_content_overrides (
    module_id   INTEGER PRIMARY KEY,
    content     TEXT NOT NULL,
    updated_at  TEXT DEFAULT (datetime('now')),
    updated_by  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS face_descriptors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    descriptor TEXT NOT NULL,
    pose_label TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
  );

  CREATE INDEX IF NOT EXISTS idx_face_descriptors_student ON face_descriptors(student_id);

  CREATE TABLE IF NOT EXISTS face_verification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    distance REAL NOT NULL,
    matched INTEGER NOT NULL,
    attempt_number INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
  );

  -- Phase 1: RBAC tables
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
  );

  CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK(user_type IN ('student', 'lecturer')),
    role_id INTEGER NOT NULL,
    tenant_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    UNIQUE(user_id, user_type, role_id)
  );

  -- Phase 2: Audit logging tables
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER,
    user_id TEXT,
    user_type TEXT,
    session_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, user_type);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);

  CREATE TABLE IF NOT EXISTS session_device_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    timezone TEXT,
    language TEXT,
    platform TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_session_device_user ON session_device_info(user_id);

  -- Phase 3: Anti-fraud tables
  CREATE TABLE IF NOT EXISTS fraud_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER,
    user_id TEXT NOT NULL,
    flag_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium' CHECK(severity IN ('low', 'medium', 'high', 'critical')),
    resource_type TEXT,
    resource_id TEXT,
    details TEXT,
    is_reviewed INTEGER DEFAULT 0,
    reviewed_by TEXT,
    reviewed_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_fraud_flags_user ON fraud_flags(user_id);
  CREATE INDEX IF NOT EXISTS idx_fraud_flags_type ON fraud_flags(flag_type);
  CREATE INDEX IF NOT EXISTS idx_fraud_flags_reviewed ON fraud_flags(is_reviewed);

  -- Phase 4: AI validation tables
  CREATE TABLE IF NOT EXISTS ai_validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER,
    submission_type TEXT NOT NULL,
    submission_id INTEGER NOT NULL,
    question_id INTEGER,
    student_id TEXT NOT NULL,
    module_id INTEGER,
    ai_detection_score REAL,
    relevance_score REAL,
    quality_score REAL,
    plagiarism_indicators TEXT,
    ai_feedback TEXT,
    raw_response TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_ai_validations_submission ON ai_validations(submission_type, submission_id);
  CREATE INDEX IF NOT EXISTS idx_ai_validations_student ON ai_validations(student_id);

  -- Phase 5: Multi-tenancy tables
  CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    config TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// --- Schema migrations for existing databases ---
function migrateIfNeeded() {
  // Add password_changed_at to lecturers if missing
  const lecturerCols = db.pragma('table_info(lecturers)') as { name: string }[];
  if (!lecturerCols.find(c => c.name === 'password_changed_at')) {
    db.exec('ALTER TABLE lecturers ADD COLUMN password_changed_at TEXT');
  }

  // Add is_enrolled to students if missing
  const studentCols = db.pragma('table_info(students)') as { name: string }[];
  if (!studentCols.find(c => c.name === 'is_enrolled')) {
    db.exec('ALTER TABLE students ADD COLUMN is_enrolled INTEGER DEFAULT 0');
    db.exec('UPDATE students SET is_enrolled = 1');
  }

  // Add is_face_registered to students if missing
  const studentCols2 = db.pragma('table_info(students)') as { name: string }[];
  if (!studentCols2.find(c => c.name === 'is_face_registered')) {
    db.exec('ALTER TABLE students ADD COLUMN is_face_registered INTEGER DEFAULT 0');
  }

  // Phase 5: Add tenant_id columns to existing tables
  const tablesToAddTenantId = [
    'students', 'lecturers', 'login_sessions', 'module_visits',
    'lab_step_completions', 'lab_submissions', 'case_study_submissions',
    'quiz_attempts', 'face_descriptors', 'face_verification_logs',
  ];

  for (const table of tablesToAddTenantId) {
    const cols = db.pragma(`table_info(${table})`) as { name: string }[];
    if (!cols.find(c => c.name === 'tenant_id')) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN tenant_id INTEGER DEFAULT 1`);
    }
  }

  // Create default tenant if not exists
  const tenantExists = db.prepare('SELECT id FROM tenants WHERE id = 1').get();
  if (!tenantExists) {
    db.prepare(
      "INSERT OR IGNORE INTO tenants (id, name, slug) VALUES (1, 'Universitas Bina Insani', 'bina-insani')"
    ).run();
  }
}

try {
  migrateIfNeeded();
} catch (e) {
  console.warn('[db] Migration warning:', e);
}

export default db;
