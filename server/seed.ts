import db from './db';
import { hashPassword } from './auth';
import { logger } from './services/logger';

export function seedDefaultLecturer(): void {
  const existing = db.prepare('SELECT id FROM lecturers WHERE username = ?').get('admin');

  if (existing) {
    logger.info('Default lecturer already exists, skipping.', { tag: 'seed' });
    return;
  }

  if (!process.env.LECTURER_DEFAULT_PASSWORD) {
    throw new Error('LECTURER_DEFAULT_PASSWORD environment variable is required. Set it in .env.local');
  }
  const password = process.env.LECTURER_DEFAULT_PASSWORD;
  const { hash, salt } = hashPassword(password);

  db.prepare(
    'INSERT INTO lecturers (username, password_hash, salt, display_name) VALUES (?, ?, ?, ?)'
  ).run('admin', hash, salt, 'Dosen Pengampu');

  logger.info('Default lecturer created (username: admin).', { tag: 'seed' });
}

export function seedRolesAndPermissions(): void {
  const roles = [
    { name: 'student', description: 'Student role' },
    { name: 'lecturer', description: 'Lecturer role' },
    { name: 'tenant_admin', description: 'Tenant administrator role' },
    { name: 'super_admin', description: 'Super administrator role' },
  ];

  const permissions = [
    { name: 'view_students', description: 'View student list and details' },
    { name: 'grade_essays', description: 'Grade essay submissions' },
    { name: 'manage_content', description: 'Manage module content' },
    { name: 'view_audit_logs', description: 'View audit logs' },
    { name: 'manage_enrollment', description: 'Manage student enrollment' },
    { name: 'manage_tenants', description: 'Manage tenants' },
    { name: 'manage_roles', description: 'Manage user roles' },
    { name: 'view_analytics', description: 'View analytics and statistics' },
    { name: 'view_fraud_indicators', description: 'View fraud flags and indicators' },
    { name: 'export_data', description: 'Export data as CSV' },
    { name: 'manage_lecturers', description: 'Create and manage lecturer accounts' },
  ];

  const rolePermissionMap: Record<string, string[]> = {
    student: [],
    lecturer: ['view_students', 'grade_essays', 'manage_content', 'view_audit_logs', 'manage_enrollment', 'view_analytics', 'view_fraud_indicators', 'export_data', 'manage_lecturers'],
    tenant_admin: ['view_students', 'grade_essays', 'manage_content', 'view_audit_logs', 'manage_enrollment', 'manage_roles', 'view_analytics', 'view_fraud_indicators', 'export_data'],
    super_admin: ['view_students', 'grade_essays', 'manage_content', 'view_audit_logs', 'manage_enrollment', 'manage_tenants', 'manage_roles', 'view_analytics', 'view_fraud_indicators', 'export_data'],
  };

  const insertRole = db.prepare('INSERT OR IGNORE INTO roles (name, description) VALUES (?, ?)');
  const insertPerm = db.prepare('INSERT OR IGNORE INTO permissions (name, description) VALUES (?, ?)');

  for (const role of roles) {
    insertRole.run(role.name, role.description);
  }

  for (const perm of permissions) {
    insertPerm.run(perm.name, perm.description);
  }

  // Map role_permissions
  const getRoleId = db.prepare('SELECT id FROM roles WHERE name = ?');
  const getPermId = db.prepare('SELECT id FROM permissions WHERE name = ?');
  const insertRP = db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)');

  for (const [roleName, permNames] of Object.entries(rolePermissionMap)) {
    const role = getRoleId.get(roleName) as { id: number } | undefined;
    if (!role) continue;

    for (const permName of permNames) {
      const perm = getPermId.get(permName) as { id: number } | undefined;
      if (!perm) continue;
      insertRP.run(role.id, perm.id);
    }
  }

  // Assign existing admin lecturer the 'lecturer' role
  const admin = db.prepare('SELECT id FROM lecturers WHERE username = ?').get('admin') as { id: number } | undefined;
  if (admin) {
    const lecturerRole = getRoleId.get('lecturer') as { id: number } | undefined;
    if (lecturerRole) {
      db.prepare('INSERT OR IGNORE INTO user_roles (user_id, user_type, role_id, tenant_id) VALUES (?, ?, ?, ?)')
        .run(String(admin.id), 'lecturer', lecturerRole.id, 1);
    }
  }

  logger.info('Roles and permissions seeded.', { tag: 'seed' });
}
