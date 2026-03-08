import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import db from './server/db';
import authRoutes from './server/routes/auth.routes';
import progressRoutes from './server/routes/progress.routes';
import lecturerRoutes from './server/routes/lecturer.routes';
import contentRoutes from './server/routes/content.routes';
import chatbotRoutes from './server/routes/chatbot.routes';
import faceRoutes from './server/routes/face.routes';
import auditRoutes from './server/routes/audit.routes';
import tenantRoutes from './server/routes/tenant.routes';
import deadlineRoutes from './server/routes/deadline.routes';
import discussionRoutes from './server/routes/discussion.routes';
import notificationRoutes from './server/routes/notification.routes';
import { csrfProtection } from './server/middleware/csrf';
import { seedDefaultLecturer, seedRolesAndPermissions } from './server/seed';
import { cleanupRevokedTokens } from './server/auth';
import { initFaceService } from './server/services/face.service';

// --- Startup validation ---
const REQUIRED_ENV = ['JWT_SECRET', 'PHOTO_ENCRYPTION_KEY', 'LECTURER_DEFAULT_PASSWORD'] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[FATAL] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const jwtSecret = process.env.JWT_SECRET!;
const WEAK_SECRETS = ['dev-secret-change-in-production-use-a-long-random-string', 'change-me-to-a-random-secret-in-production'];
if (WEAK_SECRETS.includes(jwtSecret)) {
  console.error('[FATAL] JWT_SECRET is a known default. Generate one with: openssl rand -hex 32');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' && jwtSecret.length < 64) {
  console.error('[FATAL] JWT_SECRET must be at least 64 hex chars in production. Generate with: openssl rand -hex 32');
  process.exit(1);
}
if (jwtSecret.length < 32) {
  console.warn('[WARN] JWT_SECRET is short. Use at least 64 hex chars: openssl rand -hex 32');
}

const photoKey = process.env.PHOTO_ENCRYPTION_KEY!;
if (!/^[0-9a-fA-F]+$/.test(photoKey)) {
  console.error('[FATAL] PHOTO_ENCRYPTION_KEY must be valid hex. Generate with: openssl rand -hex 32');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' && photoKey.length < 64) {
  console.error('[FATAL] PHOTO_ENCRYPTION_KEY must be at least 64 hex chars. Generate with: openssl rand -hex 32');
  process.exit(1);
}

const COMMON_PASSWORDS = ['admin123', 'password', '123456', 'admin', 'password123', 'letmein', 'qwerty'];
if (COMMON_PASSWORDS.includes(process.env.LECTURER_DEFAULT_PASSWORD!)) {
  console.warn('[WARN] LECTURER_DEFAULT_PASSWORD is a common password. Use a strong password in production.');
}

const app = express();
const PORT = Number(process.env.SERVER_PORT) || 3001;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

// --- Trust proxy for correct req.ip behind reverse proxy ---
app.set('trust proxy', 1);

// --- CORS: restricted to localhost:3000 (manual, no extra dep) ---
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// --- Body parser: 1MB default, 10MB for face routes (base64 photos) ---
app.use('/api/face', express.json({ limit: '10mb' }));
app.use(express.json({ limit: '1mb' }));

// --- Security headers middleware ---
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; frame-src https://www.youtube-nocookie.com; style-src 'self'; img-src 'self' data:; object-src 'none'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// --- CSRF protection on state-changing requests ---
app.use('/api', csrfProtection);

// --- Mount routes ---
app.use('/api/face', faceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/lecturer', lecturerRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/notifications', notificationRoutes);

// --- Health check ---
app.get('/api/health', (_req: Request, res: Response) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({
      status: 'healthy',
      db: 'ok',
      uptime: process.uptime(),
      memory: process.memoryUsage().rss,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({ status: 'unhealthy', db: 'error' });
  }
});

// --- Serve React frontend in production ---
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  // React Router fallback: serve index.html for all non-API routes
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // --- 404 handler (dev only) ---
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });
}

// --- Global error handler ---
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// --- Seed default data ---
seedDefaultLecturer();
seedRolesAndPermissions();

// --- Periodic cleanup of expired revoked tokens (every hour) ---
setInterval(() => {
  try { cleanupRevokedTokens(); } catch (e) { console.error('Token cleanup error:', e); }
}, 60 * 60 * 1000);

// --- Async startup: load face models, then start server ---
let server: ReturnType<typeof app.listen>;

(async () => {
  try {
    await initFaceService();
  } catch (e) {
    console.warn('[server] Face service init failed (face recognition disabled):', e);
  }

  server = app.listen(PORT, () => {
    console.log(`[server] InfoSec LMS backend running on http://localhost:${PORT}`);
  });
})();

// --- Graceful shutdown ---
function gracefulShutdown(signal: string) {
  console.log(`\n[server] Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('[server] HTTP server closed.');
      db.close();
      console.log('[server] Database connection closed.');
      process.exit(0);
    });
  } else {
    db.close();
    process.exit(0);
  }

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('[server] Forced shutdown after timeout.');
    db.close();
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection:', reason);
});
