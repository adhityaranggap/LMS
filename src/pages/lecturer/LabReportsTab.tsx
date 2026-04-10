import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, ExternalLink, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { api } from '../../lib/api';
import type { LabSessionRow, LabReportStats } from '../../types/lecturer';

interface LabReportsTabProps {
  isActive: boolean;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

function parseObjectives(completed: string | null, template: string | null): { done: number; total: number } {
  try {
    const completedArr: boolean[] = completed ? JSON.parse(completed) : [];
    const templateArr: unknown[] = template ? JSON.parse(template) : [];
    const total = Math.max(completedArr.length, templateArr.length);
    const done = completedArr.filter(Boolean).length;
    return { done, total };
  } catch {
    return { done: 0, total: 0 };
  }
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-slate-400 text-sm">—</span>;
  const color =
    score >= 80 ? 'bg-emerald-100 text-emerald-700' :
    score >= 50 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {score}%
    </span>
  );
}

export const LabReportsTab: React.FC<LabReportsTabProps> = React.memo(({ isActive }) => {
  const [sessions, setSessions] = useState<LabSessionRow[]>([]);
  const [stats, setStats] = useState<LabReportStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [studentFilter, setStudentFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const LIMIT = 25;

  const loadStats = useCallback(async () => {
    try {
      const data = await api<LabReportStats>('/api/labs/admin/report-stats');
      setStats(data);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        student: studentFilter,
        module: String(moduleFilter),
      });
      const data = await api<{ sessions: LabSessionRow[]; total: number; page: number; limit: number }>(
        `/api/labs/admin/reports?${params}`
      );
      setSessions(data.sessions);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, studentFilter, moduleFilter]);

  useEffect(() => {
    if (!isActive) return;
    loadStats();
  }, [isActive, loadStats]);

  useEffect(() => {
    if (!isActive) return;
    loadSessions();
  }, [isActive, loadSessions]);

  // Reset to page 1 when filters change
  const handleFilterChange = (newStudent: string, newModule: number) => {
    setStudentFilter(newStudent);
    setModuleFilter(newModule);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const modules = Array.from(new Set(sessions.map(s => s.module_id))).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-indigo-500" />
          Lab Reports
        </h2>
        <Link
          to="/lecturer/labs"
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Manage Environments
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse">
              <div className="h-8 w-16 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
            </div>
          ))
        ) : stats ? (
          <>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="text-2xl font-bold text-indigo-600">{stats.total_sessions}</div>
              <div className="text-sm text-slate-500">Total Sessions</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="text-2xl font-bold text-slate-700">
                {stats.avg_score !== null ? `${stats.avg_score}%` : '—'}
              </div>
              <div className="text-sm text-slate-500">Avg Score</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="text-2xl font-bold text-slate-700">
                {stats.avg_duration_minutes !== null ? `${stats.avg_duration_minutes}m` : '—'}
              </div>
              <div className="text-sm text-slate-500">Avg Duration</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="text-2xl font-bold text-slate-700">{stats.unique_students}</div>
              <div className="text-sm text-slate-500">Unique Students</div>
            </div>
          </>
        ) : null}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student..."
            value={studentFilter}
            onChange={e => handleFilterChange(e.target.value, moduleFilter)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <select
          value={moduleFilter}
          onChange={e => handleFilterChange(studentFilter, parseInt(e.target.value, 10))}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value={0}>All Modules</option>
          {modules.map(m => (
            <option key={m} value={m}>Module {m}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No lab sessions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Lab</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Score</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Objectives</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Duration</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map(s => {
                  const { done, total: objTotal } = parseObjectives(s.objectives_completed, s.template_objectives);
                  const isActive = s.ended_at === null;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{s.student_name || s.student_id}</div>
                        <div className="text-xs text-slate-400">{s.student_name ? s.student_id : ''}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {s.lab_name || `Module ${s.module_id}`}
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={s.auto_grade_score} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {objTotal > 0 ? `${done}/${objTotal}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDuration(s.duration_seconds)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {s.started_at ? new Date(s.started_at).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            In Progress
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Done
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Page {page} of {totalPages} ({total} sessions)</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
