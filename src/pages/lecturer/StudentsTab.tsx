import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { StudentRow, SortKey } from '../../types/lecturer';
import { formatDate, progressPercent } from './helpers';

interface StudentsTabProps {
  loadingStudents: boolean;
  students: StudentRow[];
  sortKey: SortKey;
  onSort: (key: SortKey) => void;
  courseFilter: 'all' | 'infosec' | 'crypto';
  setCourseFilter: (v: 'all' | 'infosec' | 'crypto') => void;
  paginatedStudents: StudentRow[];
  sortedStudentsLength: number;
  studentPage: number;
  totalPages: number;
  setStudentPage: React.Dispatch<React.SetStateAction<number>>;
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

export const StudentsTab: React.FC<StudentsTabProps> = ({
  loadingStudents, students, sortKey, onSort, courseFilter, setCourseFilter,
  paginatedStudents, sortedStudentsLength, studentPage, totalPages, setStudentPage,
}) => (
  <>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Students</h1>
        <p className="text-sm text-slate-500 mt-1">Click a student to view detailed progress.</p>
      </div>
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {([['all', 'Semua'], ['infosec', 'Pengujian Keamanan'], ['crypto', 'Kriptografi']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setCourseFilter(val); setStudentPage(1); }}
            className={clsx(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
              courseFilter === val ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mata Kuliah</th>
                <SortableHeader sortKeyName="last_login" label="Last Login" currentSortKey={sortKey} onSort={onSort} />
                <SortableHeader sortKeyName="modules_visited" label="Modules Visited" currentSortKey={sortKey} onSort={onSort} />
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
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'text-[10px] px-2 py-0.5 rounded-full font-semibold',
                      s.course_id === 'crypto' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {s.course_id === 'crypto' ? 'Kriptografi' : 'Peng. Keamanan'}
                    </span>
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
  </>
);
