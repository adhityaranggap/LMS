import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import type { LoginSession } from '../../types/lecturer';
import { formatDateTime } from './helpers';

interface HistoryTabProps {
  sessions: LoginSession[];
  loadingSessions: boolean;
}

export const HistoryTab: React.FC<HistoryTabProps> = React.memo(({ sessions, loadingSessions }) => (
  <>
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Login History</h1>
      <p className="text-sm text-slate-500 mt-1">Recent student login sessions with photos.</p>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {loadingSessions ? (
        <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="p-6 text-center text-slate-400 text-sm">No login history.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {sessions.map((s, i) => (
            <div key={`${s.student_id}-${i}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm flex-shrink-0 bg-slate-100 flex items-center justify-center">
                {s.photo ? (
                  <img src={s.photo} alt={s.student_id} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <Users className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/lecturer/student/${s.student_id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                  {s.student_id}
                </Link>
                <p className="text-xs text-slate-400">{formatDateTime(s.login_time)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </>
));
