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
// OWASP recommended: N>=32768, r=8, p=1; maxmem must be set explicitly (default 32MB is too tight)
const SCRYPT_PARAMS = { N: 32768, r: 8, p: 1, maxmem: 67108864 }; // 64MB
const SCRYPT_KEYLEN = 64;

export interface HashedPassword {
  hash: string;
  salt: string;
}

export function hashPassword(password: string): HashedPassword {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  // Try current params first, fall back to old default params (N=16384) for migration
  const hash = crypto.scryptSync(password, storedSalt, SCRYPT_KEYLEN, SCRYPT_PARAMS).toString('hex');
  if (crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))) return true;

  // Fallback: verify with old default params and silently accept (user should change password)
  const hashLegacy = crypto.scryptSync(password, storedSalt, SCRYPT_KEYLEN).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hashLegacy, 'hex'), Buffer.from(storedHash, 'hex'));
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
  const sigBuf = Buffer.from(signature, 'hex');
  const expectedBuf = Buffer.from(expectedSignature, 'hex');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
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

  // Check if token was issued before a password change (session invalidation)
  if (payload.role !== 'student') {
    try {
      const lecturer = db.prepare('SELECT tokens_invalidated_at FROM lecturers WHERE id = ?').get(Number(payload.id)) as { tokens_invalidated_at: string | null } | undefined;
      if (lecturer?.tokens_invalidated_at) {
        const invalidatedAt = new Date(lecturer.tokens_invalidated_at).getTime();
        // Token was issued before invalidation (exp - 24h = issue time approximately)
        const tokenIssuedAt = payload.exp - 24 * 60 * 60 * 1000;
        if (tokenIssuedAt < invalidatedAt) {
          res.status(401).json({ error: 'Session invalidated. Please log in again.' });
          return;
        }
      }
    } catch {
      // Column may not exist yet
    }
  }

  // Load permissions from cache or user_roles + role_permissions
  const userType = payload.role === 'student' ? 'student' : 'lecturer';
  let permissions: string[] = getCachedPermissions(payload.id, userType) ?? [];
  if (permissions.length === 0) {
    try {
      const perms = db.prepare(`
        SELECT DISTINCT p.name FROM permissions p
        INNER JOIN role_permissions rp ON rp.permission_id = p.id
        INNER JOIN user_roles ur ON ur.role_id = rp.role_id
        WHERE ur.user_id = ? AND ur.user_type = ?
      `).all(payload.id, userType) as { name: string }[];
      permissions = perms.map(p => p.name);
      setCachedPermissions(payload.id, userType, permissions);
    } catch (err) {
      console.warn('[auth] Failed to load permissions for user', payload.id, ':', err);
    }
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

// Permission cache with 5-minute TTL
const permCache = new Map<string, { perms: string[]; exp: number }>();
const PERM_CACHE_TTL_MS = 5 * 60 * 1000;

export function clearPermissionCache(): void {
  permCache.clear();
}

function getCachedPermissions(userId: string, userType: string): string[] | null {
  const key = `${userId}:${userType}`;
  const cached = permCache.get(key);
  if (cached && cached.exp > Date.now()) return cached.perms;
  if (cached) permCache.delete(key);
  return null;
}

function setCachedPermissions(userId: string, userType: string, perms: string[]): void {
  permCache.set(`${userId}:${userType}`, { perms, exp: Date.now() + PERM_CACHE_TTL_MS });
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
