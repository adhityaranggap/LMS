import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { syllabusData } from '../data/syllabus-data';
import { cryptoSyllabusData } from '../data/crypto-syllabus-data';
import { COURSES } from '../data/courses';
import type { ModuleData, TheoryItem, VideoResource, LabStep, QuizQuestion } from '../data/syllabus-data';
import {
  Shield,
  LayoutDashboard,
  Users,
  History,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Clock,
  FileQuestion,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Check,
  ScanFace,
  AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';

// --- Types ---

interface DashboardStats {
  totalStudents: number;
  activeToday: number;
  avgQuizScore: number | null;
  ungradedEssays: number;
}

interface StudentRow {
  student_id: string;
  created_at: string;
  last_login: string | null;
  modules_visited: number;
  avg_score: number | null;
}

interface LoginSession {
  student_id: string;
  photo: string;
  login_time: string;
}

type SortKey = 'student_id' | 'last_login' | 'modules_visited' | 'avg_score';
type SortDir = 'asc' | 'desc';

type SidebarTab = 'dashboard' | 'students' | 'history' | 'content' | 'face' | 'audit' | 'fraud';

interface FaceStatusRow {
  student_id: string;
  is_face_registered: number;
  created_at: string;
  face_registered_at: string | null;
  descriptor_count: number;
}

interface FaceMismatchLog {
  student_id: string;
  distance: number;
  matched: number;
  attempt_number: number;
  created_at: string;
}

// --- Helpers ---

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function progressPercent(visited: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((visited / total) * 100);
}

// --- Component ---

export const LecturerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Loading / error
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingFace, setLoadingFace] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sort state for students table
  const [sortKey, setSortKey] = useState<SortKey>('student_id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Pagination for students
  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 10;

  // --- Data fetching ---

  useEffect(() => {
    api<DashboardStats>(
      '/api/lecturer/dashboard-stats',
    )
      .then((data) => setStats(data))
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

  const sortedStudents = [...students].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortKey) {
      case 'student_id':
        return dir * a.student_id.localeCompare(b.student_id);
      case 'last_login': {
        const aTime = a.last_login ? new Date(a.last_login).getTime() : 0;
        const bTime = b.last_login ? new Date(b.last_login).getTime() : 0;
        return dir * (aTime - bTime);
      }
      case 'modules_visited':
        return dir * (a.modules_visited - b.modules_visited);
      case 'avg_score':
        return dir * ((a.avg_score ?? 0) - (b.avg_score ?? 0));
      default:
        return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / studentsPerPage));
  const paginatedStudents = sortedStudents.slice(
    (studentPage - 1) * studentsPerPage,
    studentPage * studentsPerPage,
  );

  // --- Sidebar nav items ---

  const navItems: { key: SidebarTab; label: string; icon: React.ElementType }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'history', label: 'Login History', icon: History },
    { key: 'content', label: 'Edit Materi', icon: BookOpen },
    { key: 'face', label: 'Face Recognition', icon: ScanFace },
  ];

  // --- Stat cards config ---

  const statCards = stats
    ? [
        {
          label: 'Total Students',
          value: stats.totalStudents,
          icon: Users,
          color: 'bg-indigo-50 text-indigo-600',
        },
        {
          label: 'Active Today',
          value: stats.activeToday,
          icon: TrendingUp,
          color: 'bg-emerald-50 text-emerald-600',
        },
        {
          label: 'Avg Quiz Score',
          value: stats.avgQuizScore != null ? `${stats.avgQuizScore}%` : '-',
          icon: Clock,
          color: 'bg-amber-50 text-amber-600',
        },
        {
          label: 'Ungraded Essays',
          value: stats.ungradedEssays,
          icon: FileQuestion,
          color: 'bg-rose-50 text-rose-600',
        },
      ]
    : [];

  // --- Column header helper ---

  const SortableHeader: React.FC<{ sortKeyName: SortKey; label: string }> = ({
    sortKeyName,
    label,
  }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700 transition-colors"
      onClick={() => handleSort(sortKeyName)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={clsx(
            'w-3 h-3 transition-colors',
            sortKey === sortKeyName ? 'text-indigo-600' : 'text-slate-300',
          )}
        />
      </span>
    </th>
  );

  // --- Content Editor State ---

  const [contentCourse, setContentCourse] = useState<'infosec' | 'crypto'>('infosec');
  const [overrideStatuses, setOverrideStatuses] = useState<Set<number>>(new Set());
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [contentEditorTab, setContentEditorTab] = useState<'materi' | 'video' | 'lab' | 'studi' | 'quiz'>('materi');
  const [editData, setEditData] = useState<ModuleData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Load override statuses when content tab is active
  useEffect(() => {
    if (activeTab !== 'content') return;
    api<{ overrides: { module_id: number }[] }>('/api/content')
      .then(data => {
        setOverrideStatuses(new Set(data.overrides.map(o => o.module_id)));
      })
      .catch(() => {});
  }, [activeTab]);

  // Load module content when selection changes
  const loadModuleForEdit = useCallback((moduleId: number) => {
    setContentLoading(true);
    const allModules = [...syllabusData, ...cryptoSyllabusData];
    const base = allModules.find(m => m.id === moduleId)!;
    api<{ override: Partial<ModuleData> | null }>(`/api/content/${moduleId}`)
      .then(data => {
        if (data.override) {
          setEditData({ ...base, ...data.override } as ModuleData);
        } else {
          setEditData(JSON.parse(JSON.stringify(base)));
        }
        setIsDirty(false);
      })
      .catch(() => {
        setEditData(JSON.parse(JSON.stringify(base)));
        setIsDirty(false);
      })
      .finally(() => setContentLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'content') {
      loadModuleForEdit(selectedModuleId);
    }
  }, [activeTab, selectedModuleId, loadModuleForEdit]);

  const handleSelectModule = (moduleId: number) => {
    if (isDirty && !window.confirm('Ada perubahan yang belum disimpan. Lanjutkan?')) return;
    setSelectedModuleId(moduleId);
    setContentEditorTab('materi');
  };

  const markDirty = () => setIsDirty(true);

  const handleSave = async () => {
    if (!editData) return;
    try {
      await api(`/api/content/${selectedModuleId}`, {
        method: 'PUT',
        body: JSON.stringify(editData),
      });
      setIsDirty(false);
      setOverrideStatuses(prev => new Set([...prev, selectedModuleId]));
      showToast('Perubahan berhasil disimpan');
    } catch (e: unknown) {
      showToast((e as Error).message || 'Gagal menyimpan');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset ke konten default? Semua perubahan akan hilang.')) return;
    try {
      await api(`/api/content/${selectedModuleId}`, { method: 'DELETE' });
      setOverrideStatuses(prev => {
        const next = new Set(prev);
        next.delete(selectedModuleId);
        return next;
      });
      loadModuleForEdit(selectedModuleId);
      showToast('Konten direset ke default');
    } catch (e: unknown) {
      showToast((e as Error).message || 'Gagal mereset');
    }
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Shield className="w-6 h-6 text-indigo-600" />
          <span>Lecturer Panel</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
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
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Lecturer
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {user.displayName ?? user.id}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="p-4 space-y-1 flex-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                setSidebarOpen(false);
              }}
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Monitor student activity and course progress.
                </p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loadingStats
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"
                      >
                        <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
                        <div className="h-8 w-16 bg-slate-200 rounded" />
                      </div>
                    ))
                  : statCards.map((card) => (
                      <div
                        key={card.label}
                        className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4"
                      >
                        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', card.color)}>
                          <card.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                            {card.label}
                          </p>
                          <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                        </div>
                      </div>
                    ))}
              </div>

              {/* Quick Students Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Students</h2>
                  <button
                    onClick={() => setActiveTab('students')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
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
                          <SortableHeader sortKeyName="student_id" label="Student ID" />
                          <SortableHeader sortKeyName="last_login" label="Last Login" />
                          <SortableHeader sortKeyName="modules_visited" label="Modules" />
                          <SortableHeader sortKeyName="avg_score" label="Avg Score" />
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Progress
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedStudents.map((s) => (
                          <tr
                            key={s.student_id}
                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3">
                              <Link
                                to={`/lecturer/student/${s.student_id}`}
                                className="text-indigo-600 font-medium hover:text-indigo-800"
                              >
                                {s.student_id}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {formatDate(s.last_login)}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{s.modules_visited}</td>
                            <td className="px-4 py-3 text-slate-600">
                              {s.avg_score != null ? `${s.avg_score}%` : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full transition-all"
                                    style={{
                                      width: `${progressPercent(s.modules_visited, 14)}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500">
                                  {progressPercent(s.modules_visited, 14)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <span>
                      Page {studentPage} of {totalPages} ({sortedStudents.length} students)
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                        disabled={studentPage === 1}
                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStudentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={studentPage === totalPages}
                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
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
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
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
                        <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-slate-200 shadow-sm">
                          <img
                            src={s.photo}
                            alt={s.student_id}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{s.student_id}</p>
                          <p className="text-[10px] text-slate-400">
                            {formatDateTime(s.login_time)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">All Students</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Click a student to view detailed progress.
                </p>
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
                          <SortableHeader sortKeyName="student_id" label="Student ID" />
                          <SortableHeader sortKeyName="last_login" label="Last Login" />
                          <SortableHeader sortKeyName="modules_visited" label="Modules Visited" />
                          <SortableHeader sortKeyName="avg_score" label="Avg Score" />
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Progress
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedStudents.map((s) => (
                          <tr
                            key={s.student_id}
                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3">
                              <Link
                                to={`/lecturer/student/${s.student_id}`}
                                className="text-indigo-600 font-medium hover:text-indigo-800"
                              >
                                {s.student_id}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {formatDate(s.last_login)}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{s.modules_visited}</td>
                            <td className="px-4 py-3 text-slate-600">
                              {s.avg_score != null ? `${s.avg_score}%` : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full transition-all"
                                    style={{
                                      width: `${progressPercent(s.modules_visited, 14)}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500">
                                  {progressPercent(s.modules_visited, 14)}%
                                </span>
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
                    <span>
                      Page {studentPage} of {totalPages} ({sortedStudents.length} students)
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                        disabled={studentPage === 1}
                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStudentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={studentPage === totalPages}
                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Edit Materi Tab */}
          {activeTab === 'content' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Edit Materi</h1>
                  <p className="text-sm text-slate-500 mt-1">Edit konten modul tanpa redeploy.</p>
                </div>
                {saveToast && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-xl">
                    <Check className="w-4 h-4" />
                    {saveToast}
                  </div>
                )}
              </div>

              <div className="flex gap-6" style={{ minHeight: '70vh' }}>
                {/* Module List */}
                <div className="w-64 flex-shrink-0 bg-white border border-slate-200 rounded-2xl overflow-hidden self-start">
                  <div className="px-3 py-2 border-b border-slate-100 flex gap-1">
                    {(['infosec', 'crypto'] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => {
                          setContentCourse(c);
                          const firstId = c === 'infosec' ? 1 : 101;
                          handleSelectModule(firstId);
                        }}
                        className={clsx(
                          'flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors',
                          contentCourse === c ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {COURSES[c].shortName}
                      </button>
                    ))}
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
                    {(contentCourse === 'infosec' ? syllabusData : cryptoSyllabusData).map(m => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectModule(m.id)}
                        className={clsx(
                          'w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between gap-2',
                          selectedModuleId === m.id
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        <span className="truncate">
                          <span className="text-slate-400 mr-1">{m.id}.</span>
                          {m.title}
                        </span>
                        {overrideStatuses.has(m.id) ? (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500" title="Diubah" />
                        ) : (
                          <span className="flex-shrink-0 text-[10px] text-slate-400 font-medium">Default</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor Panel */}
                <div className="flex-1 min-w-0">
                  {contentLoading || !editData ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 animate-pulse space-y-4">
                      <div className="h-6 w-48 bg-slate-200 rounded" />
                      <div className="h-32 bg-slate-100 rounded-xl" />
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                      {/* Editor sub-tabs */}
                      <div className="flex gap-1 px-4 pt-4 border-b border-slate-100 pb-0">
                        {(
                          [
                            { key: 'materi', label: 'Materi' },
                            { key: 'video', label: 'Video' },
                            { key: 'lab', label: 'Lab' },
                            { key: 'studi', label: 'Studi Kasus' },
                            { key: 'quiz', label: 'Quiz' },
                          ] as const
                        ).map(t => (
                          <button
                            key={t.key}
                            onClick={() => setContentEditorTab(t.key)}
                            className={clsx(
                              'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative top-px',
                              contentEditorTab === t.key
                                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                                : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Materi Tab */}
                        {contentEditorTab === 'materi' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-slate-900">Teori / Konsep Kunci</h3>
                              <button
                                onClick={() => {
                                  setEditData(prev => prev ? {
                                    ...prev,
                                    theory: [...prev.theory, { title: '', content: '' }]
                                  } : prev);
                                  markDirty();
                                }}
                                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                              >
                                <Plus className="w-4 h-4" /> Tambah
                              </button>
                            </div>
                            {editData.theory.map((item: TheoryItem, idx: number) => (
                              <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                                  <input
                                    className="flex-1 text-sm font-semibold border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Judul konsep"
                                    value={item.title}
                                    onChange={e => {
                                      const t = [...editData.theory];
                                      t[idx] = { ...t[idx], title: e.target.value };
                                      setEditData({ ...editData, theory: t });
                                      markDirty();
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      setEditData({ ...editData, theory: editData.theory.filter((_, i) => i !== idx) });
                                      markDirty();
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <textarea
                                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                  placeholder="Isi penjelasan..."
                                  rows={4}
                                  value={item.content}
                                  onChange={e => {
                                    const t = [...editData.theory];
                                    t[idx] = { ...t[idx], content: e.target.value };
                                    setEditData({ ...editData, theory: t });
                                    markDirty();
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Video Tab */}
                        {contentEditorTab === 'video' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-slate-900">Sumber Video</h3>
                              <button
                                onClick={() => {
                                  setEditData(prev => prev ? {
                                    ...prev,
                                    videoResources: [...prev.videoResources, { title: '', youtubeId: '', description: '', language: 'id', duration: '' }]
                                  } : prev);
                                  markDirty();
                                }}
                                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                              >
                                <Plus className="w-4 h-4" /> Tambah
                              </button>
                            </div>
                            {editData.videoResources.map((v: VideoResource, idx: number) => (
                              <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                  <input
                                    className="flex-1 text-sm font-semibold border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Judul video"
                                    value={v.title}
                                    onChange={e => {
                                      const vids = [...editData.videoResources];
                                      vids[idx] = { ...vids[idx], title: e.target.value };
                                      setEditData({ ...editData, videoResources: vids });
                                      markDirty();
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      setEditData({ ...editData, videoResources: editData.videoResources.filter((_, i) => i !== idx) });
                                      markDirty();
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">YouTube ID</label>
                                    <input
                                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                      placeholder="e.g. dQw4w9WgXcQ"
                                      value={v.youtubeId}
                                      onChange={e => {
                                        const vids = [...editData.videoResources];
                                        vids[idx] = { ...vids[idx], youtubeId: e.target.value };
                                        setEditData({ ...editData, videoResources: vids });
                                        markDirty();
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Durasi</label>
                                    <input
                                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                      placeholder="e.g. 15:30"
                                      value={v.duration ?? ''}
                                      onChange={e => {
                                        const vids = [...editData.videoResources];
                                        vids[idx] = { ...vids[idx], duration: e.target.value };
                                        setEditData({ ...editData, videoResources: vids });
                                        markDirty();
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Bahasa</label>
                                    <select
                                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                      value={v.language ?? 'id'}
                                      onChange={e => {
                                        const vids = [...editData.videoResources];
                                        vids[idx] = { ...vids[idx], language: e.target.value as 'id' | 'en' };
                                        setEditData({ ...editData, videoResources: vids });
                                        markDirty();
                                      }}
                                    >
                                      <option value="id">Indonesia</option>
                                      <option value="en">English</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Deskripsi</label>
                                    <input
                                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                      placeholder="Deskripsi singkat"
                                      value={v.description ?? ''}
                                      onChange={e => {
                                        const vids = [...editData.videoResources];
                                        vids[idx] = { ...vids[idx], description: e.target.value };
                                        setEditData({ ...editData, videoResources: vids });
                                        markDirty();
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            {editData.videoResources.length === 0 && (
                              <p className="text-sm text-slate-400 text-center py-8">Belum ada video. Klik Tambah untuk menambahkan.</p>
                            )}
                          </div>
                        )}

                        {/* Lab Tab */}
                        {contentEditorTab === 'lab' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900">Lab Exercise</h3>
                            <div>
                              <label className="text-xs font-medium text-slate-500 mb-1 block">Judul Lab</label>
                              <input
                                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={editData.lab.title}
                                onChange={e => {
                                  setEditData({ ...editData, lab: { ...editData.lab, title: e.target.value } });
                                  markDirty();
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-500 mb-1 block">Deliverable</label>
                              <textarea
                                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                rows={3}
                                value={editData.lab.deliverable}
                                onChange={e => {
                                  setEditData({ ...editData, lab: { ...editData.lab, deliverable: e.target.value } });
                                  markDirty();
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <h4 className="text-sm font-semibold text-slate-700">Langkah-langkah</h4>
                              <button
                                onClick={() => {
                                  const steps = [...editData.lab.steps, { title: '', description: '' }];
                                  setEditData({ ...editData, lab: { ...editData.lab, steps } });
                                  markDirty();
                                }}
                                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                              >
                                <Plus className="w-4 h-4" /> Tambah Step
                              </button>
                            </div>
                            {editData.lab.steps.map((step: LabStep, idx: number) => (
                              <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                                  <input
                                    className="flex-1 text-sm font-semibold border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Judul step"
                                    value={step.title}
                                    onChange={e => {
                                      const steps = [...editData.lab.steps];
                                      steps[idx] = { ...steps[idx], title: e.target.value };
                                      setEditData({ ...editData, lab: { ...editData.lab, steps } });
                                      markDirty();
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      const steps = editData.lab.steps.filter((_, i) => i !== idx);
                                      setEditData({ ...editData, lab: { ...editData.lab, steps } });
                                      markDirty();
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <textarea
                                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                  placeholder="Deskripsi"
                                  rows={2}
                                  value={step.description}
                                  onChange={e => {
                                    const steps = [...editData.lab.steps];
                                    steps[idx] = { ...steps[idx], description: e.target.value };
                                    setEditData({ ...editData, lab: { ...editData.lab, steps } });
                                    markDirty();
                                  }}
                                />
                                <input
                                  className="w-full text-sm font-mono border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-900 text-emerald-400"
                                  placeholder="Command (opsional)"
                                  value={step.command ?? ''}
                                  onChange={e => {
                                    const steps = [...editData.lab.steps];
                                    steps[idx] = { ...steps[idx], command: e.target.value || undefined };
                                    setEditData({ ...editData, lab: { ...editData.lab, steps } });
                                    markDirty();
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Studi Kasus Tab */}
                        {contentEditorTab === 'studi' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900">Studi Kasus</h3>
                            <div>
                              <label className="text-xs font-medium text-slate-500 mb-1 block">Skenario</label>
                              <textarea
                                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                rows={5}
                                value={editData.caseStudy.scenario}
                                onChange={e => {
                                  setEditData({ ...editData, caseStudy: { ...editData.caseStudy, scenario: e.target.value } });
                                  markDirty();
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-slate-700">Pertanyaan Diskusi</h4>
                              <button
                                onClick={() => {
                                  const questions = [...editData.caseStudy.questions, ''];
                                  setEditData({ ...editData, caseStudy: { ...editData.caseStudy, questions } });
                                  markDirty();
                                }}
                                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                              >
                                <Plus className="w-4 h-4" /> Tambah
                              </button>
                            </div>
                            {editData.caseStudy.questions.map((q: string, idx: number) => (
                              <div key={idx} className="flex gap-2">
                                <span className="text-sm text-slate-400 font-bold pt-2">Q{idx + 1}.</span>
                                <input
                                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                  placeholder="Pertanyaan..."
                                  value={q}
                                  onChange={e => {
                                    const questions = [...editData.caseStudy.questions];
                                    questions[idx] = e.target.value;
                                    setEditData({ ...editData, caseStudy: { ...editData.caseStudy, questions } });
                                    markDirty();
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const questions = editData.caseStudy.questions.filter((_, i) => i !== idx);
                                    setEditData({ ...editData, caseStudy: { ...editData.caseStudy, questions } });
                                    markDirty();
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quiz Tab */}
                        {contentEditorTab === 'quiz' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-slate-900">Soal Quiz</h3>
                              <button
                                onClick={() => {
                                  const maxId = editData.quiz.reduce((m: number, q: QuizQuestion) => Math.max(m, q.id), 0);
                                  const quiz = [...editData.quiz, { id: maxId + 1, question: '', type: 'multiple-choice' as const, options: ['', '', '', ''], answer: '' }];
                                  setEditData({ ...editData, quiz });
                                  markDirty();
                                }}
                                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                              >
                                <Plus className="w-4 h-4" /> Tambah Soal
                              </button>
                            </div>
                            {editData.quiz.map((q: QuizQuestion, idx: number) => (
                              <div key={q.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-start gap-2">
                                  <span className="text-xs font-bold text-slate-400 pt-2.5 w-5">{idx + 1}</span>
                                  <div className="flex-1 space-y-2">
                                    <textarea
                                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                      placeholder="Pertanyaan..."
                                      rows={2}
                                      value={q.question}
                                      onChange={e => {
                                        const quiz = [...editData.quiz];
                                        quiz[idx] = { ...quiz[idx], question: e.target.value };
                                        setEditData({ ...editData, quiz });
                                        markDirty();
                                      }}
                                    />
                                    <div className="flex items-center gap-3">
                                      <label className="text-xs font-medium text-slate-500">Tipe:</label>
                                      <select
                                        className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                        value={q.type}
                                        onChange={e => {
                                          const quiz = [...editData.quiz];
                                          const type = e.target.value as 'multiple-choice' | 'essay';
                                          quiz[idx] = { ...quiz[idx], type, options: type === 'multiple-choice' ? (quiz[idx].options ?? ['', '', '', '']) : undefined };
                                          setEditData({ ...editData, quiz });
                                          markDirty();
                                        }}
                                      >
                                        <option value="multiple-choice">Pilihan Ganda</option>
                                        <option value="essay">Essay</option>
                                      </select>
                                    </div>
                                    {q.type === 'multiple-choice' && q.options && (
                                      <div className="space-y-1">
                                        {q.options.map((opt, oi) => (
                                          <div key={oi} className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400 font-bold">{String.fromCharCode(65 + oi)}.</span>
                                            <input
                                              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                              placeholder={`Opsi ${String.fromCharCode(65 + oi)}`}
                                              value={opt}
                                              onChange={e => {
                                                const quiz = [...editData.quiz];
                                                const options = [...(quiz[idx].options ?? [])];
                                                options[oi] = e.target.value;
                                                quiz[idx] = { ...quiz[idx], options };
                                                setEditData({ ...editData, quiz });
                                                markDirty();
                                              }}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    <div>
                                      <label className="text-xs font-medium text-slate-500 mb-1 block">
                                        {q.type === 'multiple-choice' ? 'Jawaban benar (A/B/C/D atau teks opsi)' : 'Referensi jawaban essay'}
                                      </label>
                                      <input
                                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Jawaban..."
                                        value={q.answer}
                                        onChange={e => {
                                          const quiz = [...editData.quiz];
                                          quiz[idx] = { ...quiz[idx], answer: e.target.value };
                                          setEditData({ ...editData, quiz });
                                          markDirty();
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setEditData({ ...editData, quiz: editData.quiz.filter((_, i) => i !== idx) });
                                      markDirty();
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                          <button
                            onClick={handleSave}
                            disabled={!isDirty}
                            className={clsx(
                              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                              isDirty
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            )}
                          >
                            <Save className="w-4 h-4" />
                            Simpan Perubahan
                          </button>
                          <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Reset ke Default
                          </button>
                          {isDirty && (
                            <span className="text-xs text-amber-600 font-medium">Ada perubahan belum disimpan</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Face Recognition Tab */}
          {activeTab === 'face' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Face Recognition</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Kelola registrasi wajah mahasiswa dan lihat log verifikasi gagal.
                </p>
              </div>

              {/* Face Status Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900">Status Registrasi Wajah</h2>
                </div>
                {loadingFace ? (
                  <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
                ) : faceStatuses.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">Belum ada data mahasiswa.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-3 text-left">NIM</th>
                          <th className="px-6 py-3 text-left">Terdaftar</th>
                          <th className="px-6 py-3 text-left">Tanggal Registrasi</th>
                          <th className="px-6 py-3 text-left">Deskriptor</th>
                          <th className="px-6 py-3 text-left">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {faceStatuses.map((s) => (
                          <tr key={s.student_id} className="hover:bg-slate-50">
                            <td className="px-6 py-3 font-medium text-slate-900">{s.student_id}</td>
                            <td className="px-6 py-3">
                              {s.is_face_registered ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                  <Check className="w-3 h-3" /> Ya
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                                  Belum
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-slate-500">
                              {s.face_registered_at ? formatDate(s.face_registered_at) : '-'}
                            </td>
                            <td className="px-6 py-3 text-slate-500">{s.descriptor_count}</td>
                            <td className="px-6 py-3">
                              {s.is_face_registered ? (
                                <button
                                  onClick={() => handleFaceReset(s.student_id)}
                                  className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" /> Reset
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Mismatch Logs */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Log Verifikasi Gagal
                  </h2>
                </div>
                {loadingFace ? (
                  <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
                ) : faceMismatches.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">Belum ada verifikasi gagal.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-3 text-left">NIM</th>
                          <th className="px-6 py-3 text-left">Jarak</th>
                          <th className="px-6 py-3 text-left">Percobaan</th>
                          <th className="px-6 py-3 text-left">Waktu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {faceMismatches.map((log, i) => (
                          <tr key={`${log.student_id}-${i}`} className="hover:bg-slate-50">
                            <td className="px-6 py-3 font-medium text-slate-900">{log.student_id}</td>
                            <td className="px-6 py-3">
                              <span className={clsx(
                                'font-mono text-xs px-2 py-0.5 rounded',
                                log.distance > 0.7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
                              )}>
                                {log.distance.toFixed(3)}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-slate-500">{log.attempt_number}/3</td>
                            <td className="px-6 py-3 text-slate-500">{formatDateTime(log.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Login History Tab */}
          {activeTab === 'history' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Login History</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Recent student login sessions with photos.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {loadingSessions ? (
                  <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
                ) : sessions.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">No login history.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {sessions.map((s, i) => (
                      <div
                        key={`${s.student_id}-${i}`}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm flex-shrink-0">
                          <img
                            src={s.photo}
                            alt={s.student_id}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/lecturer/student/${s.student_id}`}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            {s.student_id}
                          </Link>
                          <p className="text-xs text-slate-400">
                            {formatDateTime(s.login_time)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-0 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
