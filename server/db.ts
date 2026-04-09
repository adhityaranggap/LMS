import Database from 'better-sqlite3';
import path from 'path';
import { logger } from './services/logger';

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

  -- Deadlines
  CREATE TABLE IF NOT EXISTS deadlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER DEFAULT 1,
    module_id INTEGER NOT NULL,
    assessment_type TEXT CHECK(assessment_type IN ('quiz','case','lab')) NOT NULL,
    due_at TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(tenant_id, module_id, assessment_type)
  );

  -- Notifications
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER DEFAULT 1,
    user_id TEXT NOT NULL,
    user_type TEXT NOT NULL DEFAULT 'lecturer',
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, user_type, is_read);

  -- Discussions
  CREATE TABLE IF NOT EXISTS discussions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER DEFAULT 1,
    module_id INTEGER NOT NULL,
    student_id TEXT NOT NULL,
    user_type TEXT NOT NULL DEFAULT 'student',
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES discussions(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_discussions_module ON discussions(module_id, tenant_id);

  -- Lab simulation tables
  CREATE TABLE IF NOT EXISTS lab_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER DEFAULT 1,
    module_id INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    attacker_image TEXT DEFAULT 'biulms-attacker:latest',
    target_image TEXT DEFAULT 'biulms-target:latest',
    attacker_memory_mb INTEGER DEFAULT 384,
    target_memory_mb INTEGER DEFAULT 384,
    time_limit_minutes INTEGER DEFAULT 120,
    objectives TEXT,
    is_active INTEGER DEFAULT 1,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lab_environments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER DEFAULT 1,
    student_id TEXT NOT NULL,
    template_id INTEGER NOT NULL,
    attacker_container_id TEXT,
    target_container_id TEXT,
    network_id TEXT,
    network_name TEXT,
    attacker_ip TEXT,
    target_ip TEXT,
    status TEXT CHECK(status IN ('pending','running','stopping','stopped','failed','expired','destroyed')) DEFAULT 'pending',
    module_id INTEGER NOT NULL,
    started_at TEXT,
    expires_at TEXT,
    last_activity_at TEXT,
    error_message TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (template_id) REFERENCES lab_templates(id)
  );

  CREATE TABLE IF NOT EXISTS lab_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER DEFAULT 1,
    environment_id INTEGER NOT NULL,
    student_id TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    started_at TEXT,
    ended_at TEXT,
    duration_seconds INTEGER,
    objectives_completed TEXT,
    auto_grade_score INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (environment_id) REFERENCES lab_environments(id),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
  );

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

  // Add course_id to students if missing
  const studentCols3 = db.pragma('table_info(students)') as { name: string }[];
  if (!studentCols3.find(c => c.name === 'course_id')) {
    db.exec("ALTER TABLE students ADD COLUMN course_id TEXT DEFAULT 'infosec'");
  }

  // Phase 5: Student biodata columns
  const studentBiodataCols = db.pragma('table_info(students)') as { name: string }[];
  const biodataColumns: [string, string][] = [
    ['full_name', 'TEXT'],
    ['email', 'TEXT'],
    ['phone', 'TEXT'],
    ['address', 'TEXT'],
    ['birth_date', 'TEXT'],
    ['gender', 'TEXT'],
    ['program_studi', 'TEXT'],
    ['semester', 'INTEGER'],
    ['angkatan', 'TEXT'],
    ['profile_photo', 'TEXT'],
  ];
  for (const [col, type] of biodataColumns) {
    if (!studentBiodataCols.find(c => c.name === col)) {
      db.exec(`ALTER TABLE students ADD COLUMN ${col} ${type}`);
    }
  }

  // Phase 6: module_content_overrides tenant isolation
  const overrideCols = db.pragma('table_info(module_content_overrides)') as { name: string }[];
  if (!overrideCols.find(c => c.name === 'tenant_id')) {
    db.exec('ALTER TABLE module_content_overrides ADD COLUMN tenant_id INTEGER DEFAULT 1');
  }

  // Phase 6: Custom modules table
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL DEFAULT 1,
      course_id TEXT NOT NULL,
      module_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      theory TEXT,
      lab TEXT,
      case_study TEXT,
      quiz TEXT,
      video_resources TEXT,
      is_published INTEGER DEFAULT 0,
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(tenant_id, course_id, module_number)
    )
  `);

  // Phase 6: Tenant courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenant_courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL DEFAULT 1,
      course_id TEXT NOT NULL,
      course_name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(tenant_id, course_id)
    )
  `);

  // Seed default courses if empty
  const courseCount = db.prepare('SELECT COUNT(*) as c FROM tenant_courses').get() as { c: number };
  if (courseCount.c === 0) {
    db.prepare("INSERT OR IGNORE INTO tenant_courses (tenant_id, course_id, course_name, description) VALUES (1, 'infosec', 'Pengujian Keamanan Informasi', 'Information Security Testing course')").run();
    db.prepare("INSERT OR IGNORE INTO tenant_courses (tenant_id, course_id, course_name, description) VALUES (1, 'crypto', 'Kriptografi', 'Cryptography course')").run();
  }

  // Add tokens_invalidated_at to lecturers for session invalidation on password change
  const lecturerCols2 = db.pragma('table_info(lecturers)') as { name: string }[];
  if (!lecturerCols2.find(c => c.name === 'tokens_invalidated_at')) {
    db.exec('ALTER TABLE lecturers ADD COLUMN tokens_invalidated_at TEXT');
  }

  // Add variant_index to case_study_submissions for per-student case study pool
  const caseStudyCols = db.pragma('table_info(case_study_submissions)') as { name: string }[];
  if (!caseStudyCols.find((c) => c.name === 'variant_index')) {
    db.exec('ALTER TABLE case_study_submissions ADD COLUMN variant_index INTEGER DEFAULT -1');
  }

  // Rate limits table for persistent rate limiting & account lockout
  db.exec(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 1,
      reset_at TEXT NOT NULL
    )
  `);

  // Account lockout table
  db.exec(`
    CREATE TABLE IF NOT EXISTS account_lockouts (
      username TEXT PRIMARY KEY,
      failures INTEGER NOT NULL DEFAULT 0,
      locked_until TEXT
    )
  `);

  // Performance indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_login_sessions_student_tenant ON login_sessions(student_id, tenant_id);
    CREATE INDEX IF NOT EXISTS idx_module_visits_student_tenant ON module_visits(student_id, tenant_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_attempts_module ON quiz_attempts(module_id);
    CREATE INDEX IF NOT EXISTS idx_lab_submissions_student ON lab_submissions(student_id);
    CREATE INDEX IF NOT EXISTS idx_lab_step_completions_student ON lab_step_completions(student_id);
    CREATE INDEX IF NOT EXISTS idx_case_study_submissions_student ON case_study_submissions(student_id);
    CREATE INDEX IF NOT EXISTS idx_students_tenant ON students(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_students_course ON students(course_id);
    CREATE INDEX IF NOT EXISTS idx_face_verification_logs_student ON face_verification_logs(student_id);
    CREATE INDEX IF NOT EXISTS idx_fraud_flags_student ON fraud_flags(user_id);
    CREATE INDEX IF NOT EXISTS idx_revoked_tokens_hash ON revoked_tokens(token_hash);
    CREATE INDEX IF NOT EXISTS idx_essay_grades_attempt ON essay_grades(quiz_attempt_id);
    CREATE INDEX IF NOT EXISTS idx_rate_limits_reset ON rate_limits(reset_at);
    CREATE INDEX IF NOT EXISTS idx_students_name ON students(full_name);
    CREATE INDEX IF NOT EXISTS idx_module_overrides_tenant ON module_content_overrides(tenant_id, module_id);
    CREATE INDEX IF NOT EXISTS idx_custom_modules_tenant ON custom_modules(tenant_id, course_id);
    CREATE INDEX IF NOT EXISTS idx_tenant_courses_tenant ON tenant_courses(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_lab_environments_student ON lab_environments(student_id, status);
    CREATE INDEX IF NOT EXISTS idx_lab_environments_status ON lab_environments(status);
    CREATE INDEX IF NOT EXISTS idx_lab_environments_expires ON lab_environments(expires_at);
    CREATE INDEX IF NOT EXISTS idx_lab_sessions_student ON lab_sessions(student_id);
    CREATE INDEX IF NOT EXISTS idx_lab_sessions_env ON lab_sessions(environment_id);
  `);

  // Seed lab templates for security modules
  const labTemplateCount = db.prepare('SELECT COUNT(*) as c FROM lab_templates').get() as { c: number };
  if (labTemplateCount.c === 0) {
    const labTemplates = [
      { module_id: 3, name: 'Linux Security Lab', description: 'Audit Linux permissions, users, and iptables configuration', objectives: JSON.stringify([
        { id: 1, description: 'Find files with world-writable permissions in /opt/data/', check_command: "find /opt/data -perm -o+w -type f | head -1", container: 'target' },
        { id: 2, description: 'Identify the SUID file', check_command: "find /opt/data -perm -4000 -type f | head -1", container: 'target' },
        { id: 3, description: 'List all users on the system', check_command: "test -f /home/student/users.txt && wc -l /home/student/users.txt | awk '$1>=3'", container: 'attacker' },
      ]) },
      { module_id: 4, name: 'ICMP & ARP Lab', description: 'Capture and analyze ICMP and ARP traffic', objectives: JSON.stringify([
        { id: 1, description: 'Capture ARP packets using tcpdump', check_command: "test -f /home/student/arp_capture.pcap || test -f /tmp/arp_capture.pcap", container: 'attacker' },
        { id: 2, description: 'Ping the target successfully', check_command: "test -f /home/student/ping_results.txt", container: 'attacker' },
      ]) },
      { module_id: 6, name: 'Network Reconnaissance Lab', description: 'Discover and enumerate network services on target', objectives: JSON.stringify([
        { id: 1, description: 'Discover 2+ open ports on target using nmap', check_command: "test -f /home/student/scan_results.txt && grep -c 'open' /home/student/scan_results.txt | awk '$1>=2'", container: 'attacker' },
        { id: 2, description: 'Identify Apache version on target', check_command: "grep -i 'apache' /home/student/scan_results.txt", container: 'attacker' },
        { id: 3, description: 'Run vulnerability scan with --script vuln', check_command: "grep -i 'vuln' /home/student/scan_results.txt || test -f /home/student/vuln_scan.txt", container: 'attacker' },
        { id: 4, description: 'Save scan results to a file', check_command: "test -f /home/student/scan_results.txt -o -f /home/student/vuln_scan.txt", container: 'attacker' },
      ]) },
      { module_id: 9, name: 'TCP/IP Vulnerability Lab', description: 'Analyze TCP/IP vulnerabilities and traffic anomalies', objectives: JSON.stringify([
        { id: 1, description: 'Capture network traffic with tcpdump', check_command: "test -f /home/student/capture.pcap || test -f /tmp/capture.pcap", container: 'attacker' },
        { id: 2, description: 'Identify SYN flood patterns', check_command: "test -f /home/student/analysis.txt && grep -i 'syn' /home/student/analysis.txt", container: 'attacker' },
      ]) },
      { module_id: 10, name: 'Access Control Lab', description: 'Audit and fix access control misconfigurations', objectives: JSON.stringify([
        { id: 1, description: 'Identify weak sudoers configuration', check_command: "test -f /home/student/audit_report.txt && grep -i 'sudo' /home/student/audit_report.txt", container: 'attacker' },
        { id: 2, description: 'Find world-readable sensitive files', check_command: "test -f /home/student/audit_report.txt && grep -i 'permission' /home/student/audit_report.txt", container: 'attacker' },
      ]) },
      { module_id: 11, name: 'Threat Intelligence Lab', description: 'Analyze certificates, keys, and threat indicators', objectives: JSON.stringify([
        { id: 1, description: 'Examine SSL certificate details', check_command: "test -f /home/student/cert_analysis.txt", container: 'attacker' },
        { id: 2, description: 'Compute and verify file hashes', check_command: "test -f /home/student/hash_results.txt", container: 'attacker' },
      ]) },
      { module_id: 12, name: 'Endpoint Profiling Lab', description: 'Profile endpoint services and identify vulnerabilities', objectives: JSON.stringify([
        { id: 1, description: 'Scan all open ports on target', check_command: "test -f /home/student/port_scan.txt && grep -c 'open' /home/student/port_scan.txt | awk '$1>=3'", container: 'attacker' },
        { id: 2, description: 'Identify vulnerable service versions', check_command: "test -f /home/student/service_versions.txt", container: 'attacker' },
      ]) },
      { module_id: 13, name: 'Log Analysis Lab', description: 'Analyze logs for brute force patterns and anomalies', objectives: JSON.stringify([
        { id: 1, description: 'Count failed SSH login attempts', check_command: "test -f /home/student/log_analysis.txt && grep -i 'failed\\|brute' /home/student/log_analysis.txt", container: 'attacker' },
        { id: 2, description: 'Identify the attacker IP address', check_command: "test -f /home/student/log_analysis.txt && grep -E '10\\.10\\.0\\.50|192\\.168' /home/student/log_analysis.txt", container: 'attacker' },
        { id: 3, description: 'Create attack timeline', check_command: "test -f /home/student/timeline.txt", container: 'attacker' },
      ]) },
      { module_id: 14, name: 'Alert & Incident Response Lab', description: 'Investigate a multi-stage attack and create incident report', objectives: JSON.stringify([
        { id: 1, description: 'Identify the backdoor file', check_command: "test -f /home/student/incident_report.txt && grep -i 'backdoor' /home/student/incident_report.txt", container: 'attacker' },
        { id: 2, description: 'Find the C2 server IP', check_command: "test -f /home/student/incident_report.txt && grep '172.16.0.99' /home/student/incident_report.txt", container: 'attacker' },
        { id: 3, description: 'List all Indicators of Compromise', check_command: "test -f /home/student/ioc_list.txt || (test -f /home/student/incident_report.txt && grep -i 'ioc\\|indicator' /home/student/incident_report.txt)", container: 'attacker' },
      ]) },
    ];

    const insertTemplate = db.prepare(
      "INSERT OR IGNORE INTO lab_templates (tenant_id, module_id, name, description, objectives) VALUES (1, ?, ?, ?, ?)"
    );
    for (const t of labTemplates) {
      insertTemplate.run(t.module_id, t.name, t.description, t.objectives);
    }
  }

  // Add manage_lecturers permission and assign to lecturer role
  const managePermExists = db.prepare("SELECT id FROM permissions WHERE name = 'manage_lecturers'").get() as { id: number } | undefined;
  if (!managePermExists) {
    db.prepare("INSERT INTO permissions (name, description) VALUES ('manage_lecturers', 'Create and manage lecturer accounts')").run();
    const perm = db.prepare("SELECT id FROM permissions WHERE name = 'manage_lecturers'").get() as { id: number } | undefined;
    const lecturerRole = db.prepare("SELECT id FROM roles WHERE name = 'lecturer'").get() as { id: number } | undefined;
    if (perm && lecturerRole) {
      db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)').run(lecturerRole.id, perm.id);
    }
  }
}

try {
  migrateIfNeeded();
} catch (e) {
  logger.warn('Migration warning', { tag: 'db', error: String(e) });
}

export default db;
