import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { AlertTriangle } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

interface ContainerHealth {
  running: boolean;
  oomKilled: boolean;
  status: string;
}

interface WebTerminalProps {
  envId: number;
  container: 'attacker' | 'target';
  className?: string;
  containerHealth?: ContainerHealth;
}

const MAX_RECONNECT_ATTEMPTS = 5;
// Codes where reconnection makes no sense
const NO_RECONNECT_CODES = [1000, 4001, 4003, 4004];

export const WebTerminal: React.FC<WebTerminalProps> = ({ envId, container, className, containerHealth }) => {
  const termRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'>('connecting');

  const connect = useCallback((term: Terminal, fitAddon: FitAddon) => {
    if (unmountedRef.current) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/terminal/${envId}/${container}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      if (unmountedRef.current) { ws.close(); return; }
      reconnectAttemptRef.current = 0;
      setStatus('connected');
      const prefix = reconnectAttemptRef.current > 0 ? 'Reconnected' : 'Connected';
      term.writeln(`\x1b[32m--- ${prefix} to ${container} terminal ---\x1b[0m\r\n`);
      const dims = fitAddon.proposeDimensions();
      if (dims) {
        ws.send(`\x01resize:${dims.cols},${dims.rows}`);
      }
    };

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        term.write(new Uint8Array(event.data));
      } else {
        term.write(event.data);
      }
    };

    ws.onclose = (event) => {
      if (unmountedRef.current) return;

      if (NO_RECONNECT_CODES.includes(event.code)) {
        setStatus('disconnected');
        term.writeln(`\r\n\x1b[31m--- Disconnected (${event.reason || 'connection closed'}) ---\x1b[0m`);
        return;
      }

      if (reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
        const attempt = ++reconnectAttemptRef.current;
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        setStatus('reconnecting');
        term.writeln(`\r\n\x1b[33m--- Connection lost. Reconnecting in ${delay / 1000}s (${attempt}/${MAX_RECONNECT_ATTEMPTS}) ---\x1b[0m`);
        reconnectTimerRef.current = setTimeout(() => connect(term, fitAddon), delay);
      } else {
        setStatus('disconnected');
        term.writeln(`\r\n\x1b[31m--- Disconnected. Max reconnection attempts reached. ---\x1b[0m`);
      }
    };

    ws.onerror = () => {
      if (!unmountedRef.current) setStatus('error');
    };

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    const handleResize = () => {
      fitAddon.fit();
      const dims = fitAddon.proposeDimensions();
      if (dims && ws.readyState === WebSocket.OPEN) {
        ws.send(`\x01resize:${dims.cols},${dims.rows}`);
      }
    };

    return handleResize;
  }, [envId, container]);

  useEffect(() => {
    if (!termRef.current) return;
    unmountedRef.current = false;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", monospace',
      theme: container === 'attacker'
        ? { background: '#1a1a2e', foreground: '#e0e0e0', cursor: '#00ff41', selectionBackground: '#44475a' }
        : { background: '#0d1117', foreground: '#c9d1d9', cursor: '#f78166', selectionBackground: '#264f78' },
      scrollback: 5000,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(termRef.current);
    fitAddon.fit();

    termInstance.current = term;
    fitAddonRef.current = fitAddon;

    const handleResize = connect(term, fitAddon);

    const resizeObserver = new ResizeObserver(() => {
      handleResize?.();
    });
    resizeObserver.observe(termRef.current);

    return () => {
      unmountedRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      resizeObserver.disconnect();
      wsRef.current?.close();
      term.dispose();
    };
  }, [envId, container, connect]);

  const handleManualReconnect = () => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    reconnectAttemptRef.current = 0;
    setStatus('connecting');
    const term = termInstance.current;
    const fitAddon = fitAddonRef.current;
    if (term && fitAddon) {
      term.writeln('\r\n\x1b[33m--- Manual reconnect... ---\x1b[0m');
      connect(term, fitAddon);
    }
  };

  const statusColors = {
    connecting: 'bg-yellow-500',
    connected: 'bg-emerald-500',
    disconnected: 'bg-slate-400',
    reconnecting: 'bg-yellow-400 animate-pulse',
    error: 'bg-red-500',
  };

  return (
    <div className={`flex flex-col ${className || ''}`}>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border-b border-slate-700 rounded-t-lg">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
        <span className="text-xs text-slate-400 font-mono uppercase tracking-wide">
          {container}
        </span>
        <span className="text-xs text-slate-500 ml-auto">{status}</span>
        {status === 'disconnected' && (
          <button
            onClick={handleManualReconnect}
            className="text-xs text-blue-400 hover:text-blue-300 ml-1 underline"
          >
            Reconnect
          </button>
        )}
      </div>
      {containerHealth && !containerHealth.running && (
        <div className="px-3 py-2 bg-red-900/80 text-red-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {containerHealth.oomKilled
            ? 'Container killed: out of memory. Use "Reset Target" to restart.'
            : `Container stopped (${containerHealth.status}). Use "Reset Target" or relaunch the lab.`
          }
        </div>
      )}
      <div ref={termRef} className="flex-1 rounded-b-lg overflow-hidden" style={{ minHeight: 300 }} />
    </div>
  );
};
