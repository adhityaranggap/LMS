import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Set CSRF token cookie. Call this on GET endpoints that serve as entry points
 * (e.g., /api/auth/me) so the frontend can read the cookie.
 */
export function setCsrfCookie(res: Response): void {
  const token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Frontend needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  });
}

/**
 * CSRF validation middleware using double-submit cookie pattern.
 * Validates that X-CSRF-Token header matches csrf_token cookie
 * on state-changing methods (POST, PUT, DELETE, PATCH).
 */
// Paths exempt from CSRF — pre-login public endpoints
const CSRF_EXEMPT_PREFIXES = ['/api/face/'];

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (safeMethod) {
    next();
    return;
  }

  // Skip CSRF for pre-login face endpoints (no session cookie available yet)
  if (CSRF_EXEMPT_PREFIXES.some(prefix => req.path.startsWith(prefix))) {
    next();
    return;
  }

  const cookieToken = parseCookies(req)[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string | undefined;

  if (!cookieToken || !headerToken) {
    res.status(403).json({ error: 'CSRF token missing.' });
    return;
  }

  // Constant-time comparison
  if (cookieToken.length !== headerToken.length) {
    res.status(403).json({ error: 'CSRF token invalid.' });
    return;
  }

  const valid = crypto.timingSafeEqual(
    Buffer.from(cookieToken, 'utf8'),
    Buffer.from(headerToken, 'utf8'),
  );

  if (!valid) {
    res.status(403).json({ error: 'CSRF token invalid.' });
    return;
  }

  next();
}

/**
 * Simple cookie parser (avoids adding cookie-parser dependency).
 */
function parseCookies(req: Request): Record<string, string> {
  const cookies: Record<string, string> = {};
  const header = req.headers.cookie;
  if (!header) return cookies;

  for (const pair of header.split(';')) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx < 0) continue;
    const key = pair.substring(0, eqIdx).trim();
    const value = pair.substring(eqIdx + 1).trim();
    cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

export { parseCookies };
