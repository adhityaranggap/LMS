import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { Search, ChevronDown, ChevronRight, ChevronLeft, Download } from 'lucide-react';
import clsx from 'clsx';

interface AuditLog {
  id: number;
  user_id: string | null;
  user_type: string | null;
  display_name: string | null;
  session_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterStudentId, setFilterStudentId] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const PAGE_SIZE = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(page * PAGE_SIZE));
      if (filterStudentId) params.set('student_id', filterStudentId);
      if (filterAction) params.set('action', filterAction);
      if (filterDateFrom) params.set('date_from', filterDateFrom);
      if (filterDateTo) params.set('date_to', filterDateTo);

      const data = await api<{ logs: AuditLog[]; total: number }>(`/api/audit/logs?${params}`);
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterStudentId, filterAction, filterDateFrom, filterDateTo]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filterDateFrom) params.set('from', filterDateFrom);
    if (filterDateTo) params.set('to', filterDateTo);
    window.open(`/api/lecturer/export/audit-logs?${params}`, '_blank');
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const actionColors: Record<string, string> = {
    login_success: 'bg-green-100 text-green-700',
    logout: 'bg-slate-100 text-slate-600',
    quiz_submit: 'bg-blue-100 text-blue-700',
    case_submit: 'bg-purple-100 text-purple-700',
    tab_hidden: 'bg-amber-100 text-amber-700',
    tab_visible: 'bg-amber-50 text-amber-600',
    fraud_flag_review: 'bg-red-100 text-red-700',
    grade_essay: 'bg-teal-100 text-teal-700',
    face_reset: 'bg-orange-100 text-orange-700',
    export_students: 'bg-violet-100 text-violet-700',
    export_audit_logs: 'bg-violet-100 text-violet-700',
    chatbot_query: 'bg-cyan-100 text-cyan-700',
    view_student: 'bg-indigo-100 text-indigo-600',
    view_student_sessions: 'bg-indigo-100 text-indigo-600',
    view_student_fraud_flags: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Log Audit</h2>
        <button onClick={handleExport} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Student ID"
            value={filterStudentId}
            onChange={e => { setFilterStudentId(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <input
          type="text"
          placeholder="Action"
          value={filterAction}
          onChange={e => { setFilterAction(e.target.value); setPage(0); }}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
        <input
          type="date"
          value={filterDateFrom}
          onChange={e => { setFilterDateFrom(e.target.value); setPage(0); }}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
        <input
          type="date"
          value={filterDateTo}
          onChange={e => { setFilterDateTo(e.target.value); setPage(0); }}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Memuat...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Tidak ada log ditemukan</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-medium text-slate-600 w-8" />
                <th className="px-4 py-3 text-left font-medium text-slate-600">Waktu</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">User</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Action</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 hidden sm:table-cell">Resource</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 hidden sm:table-cell">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <React.Fragment key={log.id}>
                  <tr
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-3">
                      {expandedId === log.id ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {log.user_type && (
                          <span className={clsx(
                            'px-1.5 py-0.5 rounded text-[10px] font-medium',
                            log.user_type === 'lecturer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          )}>
                            {log.user_type}
                          </span>
                        )}
                        <span className="font-mono text-xs">{log.display_name || log.user_id || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', actionColors[log.action] || 'bg-slate-100 text-slate-600')}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{log.resource_type ? `${log.resource_type}/${log.resource_id || ''}` : '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400 hidden sm:table-cell">{log.ip_address || '-'}</td>
                  </tr>
                  {expandedId === log.id && (
                    <tr className="bg-slate-50">
                      <td colSpan={6} className="px-8 py-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div><span className="font-medium text-slate-600">Session ID:</span> <span className="font-mono">{log.session_id || '-'}</span></div>
                          <div><span className="font-medium text-slate-600">User Agent:</span> <span className="text-slate-500">{log.user_agent || '-'}</span></div>
                          {log.details && (
                            <div className="col-span-2">
                              <span className="font-medium text-slate-600">Details:</span>
                              <pre className="mt-1 p-2 bg-white rounded border border-slate-200 text-xs overflow-x-auto">{JSON.stringify(JSON.parse(log.details), null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">{total} total log</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-600">Halaman {page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
