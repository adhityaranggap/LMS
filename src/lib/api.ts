const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Read a cookie value by name (for CSRF token).
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  // Send CSRF token on state-changing requests
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = getCookie('csrf_token');
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  // Still send Bearer token for backward compatibility during migration.
  // The server also reads the httpOnly cookie, so this is a fallback.
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let res: Response;
  try {
    res = await fetch(path, {
      ...options,
      headers,
      credentials: 'include', // Send cookies (httpOnly auth_token + csrf_token)
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    const err = new Error((body.error as string) || `Request failed: ${res.status}`);
    if (body.code) (err as Error & { code: unknown }).code = body.code;
    throw err;
  }

  return res.json() as Promise<T>;
}

// Simple in-memory cache for GET requests
const apiCache = new Map<string, { data: unknown; exp: number }>();

export async function cachedApi<T = unknown>(url: string, ttl = 30000): Promise<T> {
  const cached = apiCache.get(url);
  if (cached && cached.exp > Date.now()) return cached.data as T;
  const data = await api<T>(url);
  apiCache.set(url, { data, exp: Date.now() + ttl });
  return data;
}

export function invalidateCache(urlPattern?: string): void {
  if (!urlPattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(urlPattern)) apiCache.delete(key);
  }
}
