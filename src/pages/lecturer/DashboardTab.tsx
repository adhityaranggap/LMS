import React from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Clock, FileQuestion, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';
import type { DashboardStats, StudentRow, LoginSession, SortKey, SortDir, SidebarTab } from '../../types/lecturer';
import { formatDate, formatDateTime, progressPercent } from './helpers';

interface DashboardTabProps {
  stats: DashboardStats | null;
  loadingStats: boolean;
  students: StudentRow[];
  loadingStudents: boolean;
  sessions: LoginSession[];
  loadingSessions: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  paginatedStudents: StudentRow[];
  sortedStudentsLength: number;
  studentPage: number;
  totalPages: number;
  setStudentPage: React.Dispatch<React.SetStateAction<number>>;
  setActiveTab: (tab: SidebarTab) => void;
}

const SortableHeader: React.FC<{ sortKeyName: SortKey; label: string; currentSortKey: SortKey; onSort: (key: SortKey) => void }> = ({
  sortKeyName, label, currentSortKey, onSort,
}) => (
  <th
    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700 transition-colors"
    onClick={() => onSort(sortKeyName)}
  >
    <span className="inline-flex items-center gap-1">
      {label}
      <ArrowUpDown className={clsx('w-3 h-3 transition-colors', currentSortKey === sortKeyName ? 'text-indigo-600' : 'text-slate-300')} />
    </span>
  </th>
);

export const DashboardTab: React.FC<DashboardTabProps> = ({
  stats, loadingStats, students, loadingStudents, sessions, loadingSessions,
  sortKey, sortDir, onSort, paginatedStudents, sortedStudentsLength,
  studentPage, totalPages, setStudentPage, setActiveTab,
}) => {
  const statCards = stats
    ? [
        { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
        { label: 'Active Today', value: stats.activeToday, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Avg Quiz Score', value: stats.avgQuizScore != null ? `${stats.avgQuizScore}%` : '-', icon: Clock, color: 'bg-amber-50 text-amber-600' },
        { label: 'Ungraded Essays', value: stats.ungradedEssays, icon: FileQuestion, color: 'bg-rose-50 text-rose-600' },
      ]
    : [];

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Monitor student activity and course progress.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStats
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
                <div className="h-8 w-16 bg-slate-200 rounded" />
              </div>
            ))
          : statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', card.color)}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                </div>
              </div>
            ))}
      </div>

      {/* Quick Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Students</h2>
          <button onClick={() => setActiveTab('students')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            View All
          </button>
        </div>
        {loadingStudents ? (
          <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
        ) : students.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">No students found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <SortableHeader sortKeyName="student_id" label="Student ID" currentSortKey={sortKey} onSort={onSort} />
                  <SortableHeader sortKeyName="last_login" label="Last Login" currentSortKey={sortKey} onSort={onSort} />
                  <SortableHeader sortKeyName="modules_visited" label="Modules" currentSortKey={sortKey} onSort={onSort} />
                  <SortableHeader sortKeyName="avg_score" label="Avg Score" currentSortKey={sortKey} onSort={onSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.map((s) => (
                  <tr key={s.student_id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/lecturer/student/${s.student_id}`} className="text-indigo-600 font-medium hover:text-indigo-800">{s.student_id}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(s.last_login)}</td>
                    <td className="px-4 py-3 text-slate-600">{s.modules_visited}</td>
                    <td className="px-4 py-3 text-slate-600">{s.avg_score != null ? `${s.avg_score}%` : '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progressPercent(s.modules_visited, 14)}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{progressPercent(s.modules_visited, 14)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>Page {studentPage} of {totalPages} ({sortedStudentsLength} students)</span>
            <div className="flex gap-1">
              <button onClick={() => setStudentPage((p) => Math.max(1, p - 1))} disabled={studentPage === 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setStudentPage((p) => Math.min(totalPages, p + 1))} disabled={studentPage === totalPages} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Login History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Logins</h2>
          <button onClick={() => setActiveTab('history')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            View All
          </button>
        </div>
        {loadingSessions ? (
          <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">No login history.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
            {sessions.slice(0, 10).map((s, i) => (
              <div key={`${s.student_id}-${i}`} className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center">
                  {s.photo ? (
                    <img src={s.photo} alt={s.student_id} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Users className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">{s.student_id}</p>
                  <p className="text-[10px] text-slate-400">{formatDateTime(s.login_time)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
