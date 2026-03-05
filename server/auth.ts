import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import db from './db';

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const AUTH_COOKIE_NAME = 'auth_token';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required. Set it in .env.local');
  }
  return secret;
}

// --- Password hashing with scrypt ---

export interface HashedPassword {
  hash: string;
  salt: string;
}

export function hashPassword(password: string): HashedPassword {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  const hash = crypto.scryptSync(password, storedSalt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

// --- Token generation/verification using HMAC ---

export type CourseId = 'infosec' | 'crypto';

interface TokenPayload {
  id: string;
  role: 'student' | 'lecturer' | 'tenant_admin' | 'super_admin';
  course?: CourseId;
  tenant_id?: number;
  exp: number;
}

function createSignature(data: string): string {
  return crypto.createHmac('sha256', getJwtSecret()).update(data).digest('hex');
}

export function generateToken(id: string, role: 'student' | 'lecturer' | 'tenant_admin' | 'super_admin', course?: CourseId, tenantId?: number): string {
  const payload: TokenPayload = {
    id,
    role,
    exp: Date.now() + TOKEN_EXPIRY_MS,
  };
  if (course) payload.course = course;
  if (tenantId) payload.tenant_id = tenantId;
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createSignature(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

// --- Token revocation ---

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function revokeToken(token: string, expiresAt: Date): void {
  const tokenHash = hashToken(token);
  db.prepare(
    'INSERT OR IGNORE INTO revoked_tokens (token_hash, expires_at) VALUES (?, ?)'
  ).run(tokenHash, expiresAt.toISOString());
}

function isTokenRevoked(token: string): boolean {
  const tokenHash = hashToken(token);
  const row = db.prepare('SELECT 1 FROM revoked_tokens WHERE token_hash = ?').get(tokenHash);
  return !!row;
}

export function cleanupRevokedTokens(): void {
  db.prepare("DELETE FROM revoked_tokens WHERE expires_at < datetime('now')").run();
}

export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;

  // Verify signature
  const expectedSignature = createSignature(payloadBase64);
  if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
    return null;
  }

  // Decode and check expiry
  try {
    const payload: TokenPayload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());

    if (typeof payload.id !== 'string' || !payload.id) return null;
    if (!['student', 'lecturer', 'tenant_admin', 'super_admin'].includes(payload.role)) return null;
    if (typeof payload.exp !== 'number' || payload.exp <= Date.now()) return null;
    if (payload.course && payload.course !== 'infosec' && payload.course !== 'crypto') return null;

    // Check revocation
    if (isTokenRevoked(token)) return null;

    return payload;
  } catch {
    return null;
  }
}

// --- Express middleware ---

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'student' | 'lecturer' | 'tenant_admin' | 'super_admin';
    course?: CourseId;
    tenant_id?: number;
    permissions?: string[];
  };
}

function parseCookieToken(req: Request): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const pair of header.split(';')) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx < 0) continue;
    const key = pair.substring(0, eqIdx).trim();
    if (key === AUTH_COOKIE_NAME) {
      return decodeURIComponent(pair.substring(eqIdx + 1).trim());
    }
  }
  return null;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Try httpOnly cookie first, then fall back to Authorization header
  let token = parseCookieToken(req);

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  (req as any)._rawToken = token;
  (req as any)._tenantId = payload.tenant_id ?? 1;
  (req as any)._isSuperAdmin = payload.role === 'super_admin';

  // Load permissions from user_roles + role_permissions
  let permissions: string[] = [];
  try {
    const userType = payload.role === 'student' ? 'student' : 'lecturer';
    const perms = db.prepare(`
      SELECT DISTINCT p.name FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      INNER JOIN user_roles ur ON ur.role_id = rp.role_id
      WHERE ur.user_id = ? AND ur.user_type = ?
    `).all(payload.id, userType) as { name: string }[];
    permissions = perms.map(p => p.name);
  } catch {
    // Tables may not exist yet during initial migration
  }

  req.user = {
    id: payload.id,
    role: payload.role,
    course: payload.course,
    tenant_id: payload.tenant_id ?? 1,
    permissions,
  };
  next();
}

export function lecturerOnly(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'lecturer') {
    res.status(403).json({ error: 'Lecturer access required' });
    return;
  }
  next();
}

export function studentOnly(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'student') {
    res.status(403).json({ error: 'Student access required' });
    return;
  }
  next();
}

export function requirePermission(...requiredPermissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Super admin bypasses all permission checks
    if (req.user.role === 'super_admin') {
      next();
      return;
    }

    const userPerms = req.user.permissions ?? [];
    const hasAll = requiredPermissions.every(p => userPerms.includes(p));
    if (!hasAll) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
