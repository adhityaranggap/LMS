import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { ScoreboardRow } from '../../types/lecturer';

interface ScoreboardTabProps {
  scoreboardData: ScoreboardRow[];
  loadingScoreboard: boolean;
  scoreboardPeriod: 'daily' | 'weekly' | 'monthly';
  setScoreboardPeriod: (v: 'daily' | 'weekly' | 'monthly') => void;
  scoreboardCourse: 'all' | 'infosec' | 'crypto';
  setScoreboardCourse: (v: 'all' | 'infosec' | 'crypto') => void;
}

export const ScoreboardTab: React.FC<ScoreboardTabProps> = React.memo(({
  scoreboardData, loadingScoreboard, scoreboardPeriod, setScoreboardPeriod,
  scoreboardCourse, setScoreboardCourse,
}) => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Scoreboard</h1>
        <p className="text-sm text-slate-500 mt-1">Peringkat mahasiswa berdasarkan aktivitas dan nilai.</p>
      </div>
      <div className="flex gap-2">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {([['daily', 'Harian'], ['weekly', 'Mingguan'], ['monthly', 'Bulanan']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setScoreboardPeriod(val)}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                scoreboardPeriod === val ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {([['all', 'Semua'], ['infosec', 'InfoSec'], ['crypto', 'Kripto']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setScoreboardCourse(val)}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                scoreboardCourse === val ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {loadingScoreboard ? (
        <div className="p-8 text-center text-slate-400 text-sm">Memuat...</div>
      ) : scoreboardData.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm">Belum ada data untuk periode ini.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Mata Kuliah</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Quiz Avg</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Modules</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Labs</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Logins</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Cases</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-48">Score</th>
              </tr>
            </thead>
            <tbody>
              {scoreboardData.map(row => (
                <tr key={row.student_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold',
                      row.rank === 1 ? 'bg-amber-100 text-amber-700' :
                      row.rank === 2 ? 'bg-slate-200 text-slate-700' :
                      row.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'text-slate-500'
                    )}>
                      {row.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/lecturer/student/${row.student_id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                      {row.student_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={clsx(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      row.course_id === 'crypto' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {row.course_id === 'crypto' ? 'Kriptografi' : 'InfoSec'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs hidden sm:table-cell">{row.quiz_avg}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs hidden md:table-cell">{row.modules_visited}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs hidden md:table-cell">{row.lab_activity}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs hidden lg:table-cell">{row.login_count}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs hidden lg:table-cell">{row.case_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full transition-all',
                            row.composite_score >= 70 ? 'bg-emerald-500' :
                            row.composite_score >= 40 ? 'bg-amber-500' :
                            'bg-red-400'
                          )}
                          style={{ width: `${Math.min(row.composite_score, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-10 text-right">{row.composite_score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
));
