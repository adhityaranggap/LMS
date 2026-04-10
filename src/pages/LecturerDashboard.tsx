import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  Users,
  History,
  LogOut,
  Menu,
  X,
  TrendingUp,
  BookOpen,
  ScanFace,
  AlertTriangle,
  FileSearch,
  ShieldAlert,
  UserCog,
  FlaskConical,
} from 'lucide-react';
import { AuditLogViewer } from '../components/AuditLogViewer';
import { FraudDashboard } from '../components/FraudDashboard';
import { usePermission } from '../hooks/usePermission';
import clsx from 'clsx';

import type {
  DashboardStats, StudentRow, LoginSession, SortKey, SortDir, SidebarTab,
  FaceStatusRow, FaceMismatchLog, ScoreboardRow, LecturerAccount,
} from '../types/lecturer';

import { DashboardTab } from './lecturer/DashboardTab';
import { StudentsTab } from './lecturer/StudentsTab';
import { ScoreboardTab } from './lecturer/ScoreboardTab';
import { FaceRecognitionTab } from './lecturer/FaceRecognitionTab';
import { HistoryTab } from './lecturer/HistoryTab';
import { LecturersTab } from './lecturer/LecturersTab';
import { ContentEditorTab } from './lecturer/ContentEditorTab';
import { LabReportsTab } from './lecturer/LabReportsTab';

const AccessDenied = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
    <p className="text-sm font-medium text-amber-800">Anda tidak memiliki akses ke fitur ini.</p>
  </div>
);

export const LecturerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const canViewStudents    = usePermission('view_students');
  const canManageContent   = usePermission('manage_content');
  const canManageEnrollment = usePermission('manage_enrollment');
  const canViewAuditLogs   = usePermission('view_audit_logs');
  const canViewFraud       = usePermission('view_fraud_indicators');
  const canManageLecturers = usePermission('manage_lecturers');

  const activeTab = (searchParams.get('tab') as SidebarTab) || 'dashboard';
  const setActiveTab = (tab: SidebarTab) => {
    setSearchParams(tab === 'dashboard' ? {} : { tab });
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [faceStatuses, setFaceStatuses] = useState<FaceStatusRow[]>([]);
  const [faceMismatches, setFaceMismatches] = useState<FaceMismatchLog[]>([]);

  // Scoreboard
  const [scoreboardData, setScoreboardData] = useState<ScoreboardRow[]>([]);
  const [scoreboardPeriod, setScoreboardPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [scoreboardCourse, setScoreboardCourse] = useState<'all' | 'infosec' | 'crypto'>('all');
  const [loadingScoreboard, setLoadingScoreboard] = useState(false);

  // Lecturer accounts
  const [lecturerAccounts, setLecturerAccounts] = useState<LecturerAccount[]>([]);

  // Loading / error
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingFace, setLoadingFace] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sort & filter
  const [sortKey, setSortKey] = useState<SortKey>('student_id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [courseFilter, setCourseFilter] = useState<'all' | 'infosec' | 'crypto'>('all');
  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 10;

  // --- Data fetching ---

  useEffect(() => {
    api<DashboardStats>('/api/lecturer/dashboard-stats')
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    api<{ students: StudentRow[] }>('/api/lecturer/students')
      .then((data) => setStudents(data.students))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingStudents(false));
  }, []);

  useEffect(() => {
    api<{ logins: LoginSession[]; total: number }>('/api/lecturer/login-history?limit=20')
      .then((data) => setSessions(data.logins))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSessions(false));
  }, []);

  const fetchFaceData = useCallback(() => {
    setLoadingFace(true);
    Promise.all([
      api<{ students: FaceStatusRow[] }>('/api/lecturer/face-status'),
      api<{ logs: FaceMismatchLog[] }>('/api/lecturer/face-mismatches'),
    ])
      .then(([statusData, mismatchData]) => {
        setFaceStatuses(statusData.students);
        setFaceMismatches(mismatchData.logs);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingFace(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'face') fetchFaceData();
  }, [activeTab, fetchFaceData]);

  const fetchScoreboard = useCallback(() => {
    setLoadingScoreboard(true);
    const params = new URLSearchParams({ period: scoreboardPeriod });
    if (scoreboardCourse !== 'all') params.set('course', scoreboardCourse);
    api<{ scoreboard: ScoreboardRow[] }>(`/api/lecturer/scoreboard?${params}`)
      .then(d => setScoreboardData(d.scoreboard))
      .catch(() => setScoreboardData([]))
      .finally(() => setLoadingScoreboard(false));
  }, [scoreboardPeriod, scoreboardCourse]);

  useEffect(() => {
    if (activeTab === 'scoreboard') fetchScoreboard();
  }, [activeTab, fetchScoreboard]);

  const fetchLecturerAccounts = useCallback(() => {
    api<{ lecturers: LecturerAccount[] }>('/api/lecturer/accounts')
      .then(d => setLecturerAccounts(d.lecturers))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (activeTab === 'lecturers' && canManageLecturers) fetchLecturerAccounts();
  }, [activeTab, canManageLecturers, fetchLecturerAccounts]);

  const handleCreateLecturer = async (form: { username: string; display_name: string; password: string }) => {
    await api('/api/lecturer/accounts', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    fetchLecturerAccounts();
  };

  const handleDeleteLecturer = async (id: number) => {
    if (!confirm('Hapus akun dosen ini?')) return;
    try {
      await api(`/api/lecturer/accounts/${id}`, { method: 'DELETE' });
      fetchLecturerAccounts();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleResetPassword = async (id: number, newPassword: string) => {
    await api(`/api/lecturer/accounts/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword }),
    });
    alert('Password berhasil direset. Dosen harus mengganti password saat login.');
  };

  const handleFaceReset = async (studentId: string) => {
    try {
      await api(`/api/lecturer/face-reset/${studentId}`, { method: 'POST' });
      fetchFaceData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  // --- Sorting ---

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setStudentPage(1);
  };

  const sortedStudents = useMemo(() => {
    const filtered = courseFilter === 'all' ? students : students.filter(s => s.course_id === courseFilter);
    return [...filtered].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'student_id': return dir * a.student_id.localeCompare(b.student_id);
        case 'last_login': {
          const aTime = a.last_login ? new Date(a.last_login).getTime() : 0;
          const bTime = b.last_login ? new Date(b.last_login).getTime() : 0;
          return dir * (aTime - bTime);
        }
        case 'modules_visited': return dir * (a.modules_visited - b.modules_visited);
        case 'avg_score': return dir * ((a.avg_score ?? 0) - (b.avg_score ?? 0));
        default: return 0;
      }
    });
  }, [students, courseFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / studentsPerPage));
  const paginatedStudents = sortedStudents.slice(
    (studentPage - 1) * studentsPerPage,
    studentPage * studentsPerPage,
  );

  // --- Sidebar nav items ---

  const navItems = ([
    { key: 'dashboard', label: 'Dashboard',       icon: LayoutDashboard, allowed: true },
    { key: 'students',  label: 'Students',         icon: Users,           allowed: canViewStudents },
    { key: 'history',   label: 'Login History',    icon: History,         allowed: canViewStudents },
    { key: 'content',   label: 'Edit Materi',      icon: BookOpen,        allowed: canManageContent },
    { key: 'face',      label: 'Face Recognition', icon: ScanFace,        allowed: canManageEnrollment },
    { key: 'scoreboard', label: 'Scoreboard',      icon: TrendingUp,      allowed: canViewStudents },
    { key: 'labs',      label: 'Lab Reports',      icon: FlaskConical,    allowed: canViewStudents },
    { key: 'audit',     label: 'Audit Log',        icon: FileSearch,      allowed: canViewAuditLogs },
    { key: 'fraud',     label: 'Fraud Detection',  icon: ShieldAlert,     allowed: canViewFraud },
    { key: 'lecturers', label: 'Manage Lecturers', icon: UserCog,         allowed: canManageLecturers },
  ] as { key: SidebarTab; label: string; icon: React.ElementType; allowed: boolean }[])
    .filter(item => item.allowed);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Shield className="w-6 h-6 text-indigo-600" />
          <span>Lecturer Panel</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu" aria-expanded={sidebarOpen}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-10 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen overflow-y-auto flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Bina Insani" className="h-10 w-auto object-contain" />
            <div>
              <p className="font-bold text-slate-900 leading-tight">Bina Insani LMS</p>
              <p className="text-xs text-slate-500">Universitas Bina Insani</p>
              <p className="text-xs text-indigo-600 font-medium">Panel Dosen</p>
            </div>
          </div>
        </div>

        {user && (
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {(user.displayName ?? user.id)?.[0]?.toUpperCase() ?? 'L'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Lecturer</p>
                <p className="text-sm font-bold text-slate-900 truncate">{user.displayName ?? user.id}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="p-4 space-y-1 flex-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSidebarOpen(false); }}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-left',
                activeTab === key
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardTab
              stats={stats}
              loadingStats={loadingStats}
              students={students}
              loadingStudents={loadingStudents}
              sessions={sessions}
              loadingSessions={loadingSessions}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              paginatedStudents={paginatedStudents}
              sortedStudentsLength={sortedStudents.length}
              studentPage={studentPage}
              totalPages={totalPages}
              setStudentPage={setStudentPage}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'students' && (!canViewStudents ? <AccessDenied /> : (
            <StudentsTab
              loadingStudents={loadingStudents}
              students={students}
              sortKey={sortKey}
              onSort={handleSort}
              courseFilter={courseFilter}
              setCourseFilter={setCourseFilter}
              paginatedStudents={paginatedStudents}
              sortedStudentsLength={sortedStudents.length}
              studentPage={studentPage}
              totalPages={totalPages}
              setStudentPage={setStudentPage}
            />
          ))}

          {activeTab === 'content' && (!canManageContent ? <AccessDenied /> : (
            <ContentEditorTab isActive={activeTab === 'content'} />
          ))}

          {activeTab === 'face' && (!canManageEnrollment ? <AccessDenied /> : (
            <FaceRecognitionTab
              faceStatuses={faceStatuses}
              faceMismatches={faceMismatches}
              loadingFace={loadingFace}
              onFaceReset={handleFaceReset}
            />
          ))}

          {activeTab === 'history' && (!canViewStudents ? <AccessDenied /> : (
            <HistoryTab sessions={sessions} loadingSessions={loadingSessions} />
          ))}

          {activeTab === 'scoreboard' && (!canViewStudents ? <AccessDenied /> : (
            <ScoreboardTab
              scoreboardData={scoreboardData}
              loadingScoreboard={loadingScoreboard}
              scoreboardPeriod={scoreboardPeriod}
              setScoreboardPeriod={setScoreboardPeriod}
              scoreboardCourse={scoreboardCourse}
              setScoreboardCourse={setScoreboardCourse}
            />
          ))}

          {activeTab === 'labs' && (!canViewStudents ? <AccessDenied /> : (
            <LabReportsTab isActive={activeTab === 'labs'} />
          ))}

          {activeTab === 'audit' && (canViewAuditLogs ? <AuditLogViewer /> : <AccessDenied />)}

          {activeTab === 'fraud' && (canViewFraud ? <FraudDashboard /> : <AccessDenied />)}

          {activeTab === 'lecturers' && (!canManageLecturers ? <AccessDenied /> : (
            <LecturersTab
              lecturerAccounts={lecturerAccounts}
              currentUserId={user?.id}
              onCreateLecturer={handleCreateLecturer}
              onDeleteLecturer={handleDeleteLecturer}
              onResetPassword={handleResetPassword}
            />
          ))}
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-0 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};
