import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

interface WebTerminalProps {
  envId: number;
  container: 'attacker' | 'target';
  className?: string;
}

export const WebTerminal: React.FC<WebTerminalProps> = ({ envId, container, className }) => {
  const termRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');

  useEffect(() => {
    if (!termRef.current) return;

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

    // Connect WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/terminal/${envId}/${container}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      setStatus('connected');
      term.writeln(`\x1b[32m--- Connected to ${container} terminal ---\x1b[0m\r\n`);
      // Send initial resize
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
      setStatus('disconnected');
      term.writeln(`\r\n\x1b[31m--- Disconnected (${event.reason || 'connection closed'}) ---\x1b[0m`);
    };

    ws.onerror = () => {
      setStatus('error');
    };

    // Send terminal input to WebSocket
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
      const dims = fitAddon.proposeDimensions();
      if (dims && ws.readyState === WebSocket.OPEN) {
        ws.send(`\x01resize:${dims.cols},${dims.rows}`);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(termRef.current);

    return () => {
      resizeObserver.disconnect();
      ws.close();
      term.dispose();
    };
  }, [envId, container]);

  const statusColors = {
    connecting: 'bg-yellow-500',
    connected: 'bg-emerald-500',
    disconnected: 'bg-slate-400',
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
      </div>
      <div ref={termRef} className="flex-1 rounded-b-lg overflow-hidden" style={{ minHeight: 300 }} />
    </div>
  );
};
