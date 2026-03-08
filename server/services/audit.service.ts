import db from '../db';
import { logger } from './logger';

export interface AuditEntry {
  tenant_id?: number;
  user_id?: string;
  user_type?: string;
  session_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

const insertStmt = db.prepare(`
  INSERT INTO audit_logs (tenant_id, user_id, user_type, session_id, action, resource_type, resource_id, details, ip_address, user_agent)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

export function logAudit(entry: AuditEntry): void {
  try {
    insertStmt.run(
      entry.tenant_id ?? 1,
      entry.user_id ?? null,
      entry.user_type ?? null,
      entry.session_id ?? null,
      entry.action,
      entry.resource_type ?? null,
      entry.resource_id ?? null,
      entry.details ? JSON.stringify(entry.details) : null,
      entry.ip_address ?? null,
      entry.user_agent ?? null,
    );
  } catch (e) {
    logger.error('Failed to log audit entry', { tag: 'audit', error: String(e) });
  }
}
