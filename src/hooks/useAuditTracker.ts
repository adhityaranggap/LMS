import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuditEvent {
  action: string;
  session_id?: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
}

const BATCH_INTERVAL_MS = 10000; // 10 seconds
const MAX_BATCH_SIZE = 50;

export function useAuditTracker() {
  const { user } = useAuth();
  const eventQueue = useRef<AuditEvent[]>([]);
  const sessionId = useRef<string | null>(null);

  // Set session_id from login
  useEffect(() => {
    const stored = sessionStorage.getItem('session_id');
    if (stored) sessionId.current = stored;
  }, []);

  const flushEvents = useCallback(() => {
    if (eventQueue.current.length === 0) return;

    const events = eventQueue.current.splice(0, MAX_BATCH_SIZE);

    // Use sendBeacon for reliability
    const payload = JSON.stringify({ events });
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/audit/track', blob);
    } else {
      fetch('/api/audit/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(flushEvents, BATCH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackEvent('tab_hidden');
        flushEvents();
      } else {
        trackEvent('tab_visible');
      }
    };

    const handleBeforeUnload = () => {
      flushEvents();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushEvents();
    };
  }, [user, flushEvents]);

  const trackEvent = useCallback((action: string, details?: Record<string, unknown>) => {
    eventQueue.current.push({
      action,
      session_id: sessionId.current ?? undefined,
      ...details,
    });

    if (eventQueue.current.length >= MAX_BATCH_SIZE) {
      flushEvents();
    }
  }, [flushEvents]);

  const setSessionId = useCallback((id: string) => {
    sessionId.current = id;
    sessionStorage.setItem('session_id', id);
  }, []);

  return { trackEvent, setSessionId };
}
