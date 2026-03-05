import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { syllabus } from '../data/syllabus';
import type { QuizQuestion } from '../data/syllabus';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  BookOpen,
  FlaskConical,
  FileText,
  HelpCircle,
  CheckCircle2,
  Clock,
  Save,
  Loader2,
  AlertTriangle,
  Shield,
  Monitor,
} from 'lucide-react';
import clsx from 'clsx';

// --- Types ---

interface StudentInfo {
  student_id: string;
  created_at: string;
  last_login: string | null;
}

interface LoginRecord {
  photo: string;
  login_time: string;
}

interface ModuleVisit {
  module_id: number;
  tab: string;
  visited_at: string;
}

interface LabStepRecord {
  module_id: number;
  step_index: number;
  completed_at: string;
}

interface LabSubmission {
  module_id: number;
  file_url: string;
  submitted_at: string;
  notes?: string;
}

interface CaseSubmission {
  module_id: number;
  question_index: number;
  answer: string;
  submitted_at: string;
}

interface EssayGrade {
  question_id: number;
  grade: number | null;
  feedback: string | null;
}

interface QuizAttempt {
  id: string;
  module_id: number;
  score: number | null;
  answers: Record<string, string>;
  essay_grades?: EssayGrade[];
  created_at: string;
}

interface StudentDetailResponse {
  student: StudentInfo;
  logins: LoginRecord[];
  visits: ModuleVisit[];
  labSteps: LabStepRecord[];
  labSubmissions: LabSubmission[];
  caseSubmissions: CaseSubmission[];
  quizAttempts: QuizAttempt[];
}

interface FraudFlag {
  id: number;
  flag_type: string;
  severity: string;
  resource_type: string | null;
  resource_id: string | null;
  details: string | null;
  is_reviewed: number;
  created_at: string;
}

interface DeviceSession {
  session_id: string;
  ip_address: string | null;
  user_agent: string | null;
  screen_width: number | null;
  screen_height: number | null;
  platform: string | null;
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

// --- Component ---

export const LecturerStudentDetail: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();

  const [data, setData] = useState<StudentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Which module accordion is open (module id or null)
  const [openModule, setOpenModule] = useState<number | null>(null);

  // Essay grading local state: key = `${attemptId}-${questionId}`
  const [essayGrades, setEssayGrades] = useState<
    Record<string, { grade: string; feedback: string }>
  >({});
  const [savingEssay, setSavingEssay] = useState<string | null>(null);
  const [savedEssay, setSavedEssay] = useState<Set<string>>(new Set());
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);
  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>([]);

  // --- Fetch data ---

  useEffect(() => {
    if (!studentId) return;
    api<StudentDetailResponse>(`/api/lecturer/students/${studentId}`)
      .then((res) => {
        setData(res);
        // Initialize essay grade local state from existing grades
        const grades: Record<string, { grade: string; feedback: string }> = {};
        for (const attempt of res.quizAttempts) {
          if (attempt.essay_grades) {
            for (const eg of attempt.essay_grades) {
              const key = `${attempt.id}-${eg.question_id}`;
              grades[key] = {
                grade: eg.grade != null ? String(eg.grade) : '',
                feedback: eg.feedback ?? '',
              };
            }
          }
        }
        setEssayGrades(grades);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    // Fetch fraud flags and device sessions
    api<{ flags: FraudFlag[] }>(`/api/lecturer/students/${studentId}/fraud-flags`)
      .then((res) => setFraudFlags(res.flags))
      .catch(() => {});
    api<{ sessions: DeviceSession[] }>(`/api/lecturer/students/${studentId}/sessions`)
      .then((res) => setDeviceSessions(res.sessions))
      .catch(() => {});
  }, [studentId]);

  // --- Essay grading handlers ---

  const updateEssayField = (key: string, field: 'grade' | 'feedback', value: string) => {
    setEssayGrades((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
    // Remove saved indicator when user edits
    setSavedEssay((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleSaveGrade = async (attemptId: string, questionId: number) => {
    const key = `${attemptId}-${questionId}`;
    const entry = essayGrades[key];
    if (!entry) return;

    const gradeNum = parseInt(entry.grade, 10);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      alert('Grade must be a number between 0 and 100.');
      return;
    }

    setSavingEssay(key);
    try {
      await api('/api/lecturer/grade-essay', {
        method: 'POST',
        body: JSON.stringify({
          quizAttemptId: attemptId,
          questionId,
          grade: gradeNum,
          feedback: entry.feedback,
        }),
      });
      setSavedEssay((prev) => new Set(prev).add(key));
    } catch (e: any) {
      alert(`Failed to save grade: ${e.message}`);
    } finally {
      setSavingEssay(null);
    }
  };

  // --- Derived data per module ---

  const getModuleVisits = (moduleId: number) =>
    data?.visits.filter((v) => v.module_id === moduleId) ?? [];

  const getModuleLabSteps = (moduleId: number) =>
    data?.labSteps.filter((s) => s.module_id === moduleId) ?? [];

  const getModuleLabSubmissions = (moduleId: number) =>
    data?.labSubmissions.filter((s) => s.module_id === moduleId) ?? [];

  const getModuleCaseSubmissions = (moduleId: number) =>
    data?.caseSubmissions.filter((s) => s.module_id === moduleId) ?? [];

  const getModuleQuizAttempts = (moduleId: number) =>
    data?.quizAttempts.filter((a) => a.module_id === moduleId) ?? [];

  // --- Loading / error states ---

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/lecturer"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
            {error ?? 'Student not found.'}
          </div>
        </div>
      </div>
    );
  }

  const { student, logins } = data;
  const latestPhoto = logins.length > 0 ? logins[0].photo : null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          to="/lecturer"
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Student Info Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-100 shadow-sm flex-shrink-0">
            {latestPhoto ? (
              <img
                src={latestPhoto}
                alt={student.student_id}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                <User className="w-8 h-8 text-indigo-300" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900">{student.student_id}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined: {formatDate(student.created_at)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Last login: {formatDate(student.last_login)}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {logins.length} login session{logins.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
        </div>

        {/* Fraud Flags */}
        {fraudFlags.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Indikator Kecurangan ({fraudFlags.length})
            </h2>
            <div className="space-y-2">
              {fraudFlags.map((flag) => (
                <div key={flag.id} className={clsx(
                  "flex items-start gap-3 p-3 rounded-xl border text-sm",
                  flag.severity === 'critical' ? 'bg-red-50 border-red-200' :
                  flag.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                  flag.severity === 'medium' ? 'bg-amber-50 border-amber-200' :
                  'bg-slate-50 border-slate-200'
                )}>
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{flag.flag_type.replace(/_/g, ' ')}</span>
                      <span className={clsx(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                        flag.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        flag.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                        flag.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      )}>{flag.severity}</span>
                      {flag.is_reviewed ? (
                        <span className="text-[10px] text-emerald-600 font-medium">Reviewed</span>
                      ) : null}
                    </div>
                    {flag.details && (
                      <p className="text-xs text-slate-500 mt-1">{flag.details}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(flag.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Device & Session Info */}
        {deviceSessions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-500" />
              Informasi Perangkat & Sesi ({deviceSessions.length})
            </h2>
            <div className="space-y-2">
              {deviceSessions.slice(0, 10).map((session, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                      {session.ip_address && <span>IP: <strong>{session.ip_address}</strong></span>}
                      {session.platform && <span>Platform: <strong>{session.platform}</strong></span>}
                      {session.screen_width && session.screen_height && (
                        <span>Screen: <strong>{session.screen_width}x{session.screen_height}</strong></span>
                      )}
                    </div>
                    {session.user_agent && (
                      <p className="text-[10px] text-slate-400 mt-1 truncate">{session.user_agent}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(session.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-Module Accordion */}
        <div className="space-y-3">
          {syllabus.map((mod) => {
            const isOpen = openModule === mod.id;
            const visits = getModuleVisits(mod.id);
            const labSteps = getModuleLabSteps(mod.id);
            const labSubs = getModuleLabSubmissions(mod.id);
            const caseSubs = getModuleCaseSubmissions(mod.id);
            const quizAttempts = getModuleQuizAttempts(mod.id);
            const hasActivity =
              visits.length > 0 ||
              labSteps.length > 0 ||
              labSubs.length > 0 ||
              caseSubs.length > 0 ||
              quizAttempts.length > 0;

            return (
              <div
                key={mod.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                {/* Accordion header */}
                <button
                  onClick={() => setOpenModule(isOpen ? null : mod.id)}
                  className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <mod.icon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span className="font-medium text-slate-900 flex-1 truncate">
                    Module {mod.id}: {mod.title}
                  </span>
                  {hasActivity ? (
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                      No activity
                    </span>
                  )}
                </button>

                {/* Accordion body */}
                {isOpen && (
                  <div className="px-6 pb-6 space-y-5 border-t border-slate-100 pt-4">
                    {/* Visited Tabs */}
                    <section>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Visited Tabs
                      </h3>
                      {visits.length === 0 ? (
                        <p className="text-sm text-slate-400">No tabs visited.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {visits.map((v, i) => (
                            <span
                              key={i}
                              className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full"
                            >
                              {v.tab}
                              <span className="text-slate-400 ml-1">
                                ({formatDate(v.visited_at)})
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Lab Steps */}
                    <section>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5" />
                        Lab Steps ({labSteps.length}/{mod.lab.steps.length})
                      </h3>
                      {mod.lab.steps.length === 0 ? (
                        <p className="text-sm text-slate-400">No lab steps for this module.</p>
                      ) : (
                        <div className="space-y-1">
                          {mod.lab.steps.map((step, idx) => {
                            const completed = labSteps.find((ls) => ls.step_index === idx);
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-sm"
                              >
                                {completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0" />
                                )}
                                <span
                                  className={clsx(
                                    completed ? 'text-slate-700' : 'text-slate-400',
                                  )}
                                >
                                  {step.title}
                                </span>
                                {completed && (
                                  <span className="text-[10px] text-slate-400 ml-auto">
                                    {formatDate(completed.completed_at)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Lab Submissions */}
                      {labSubs.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-slate-500">Lab Submissions:</p>
                          {labSubs.map((sub, i) => (
                            <div
                              key={i}
                              className="text-sm bg-slate-50 rounded-xl px-3 py-2 flex items-center gap-2"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <a
                                href={sub.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 underline truncate"
                              >
                                {sub.file_url.split('/').pop() ?? 'Download'}
                              </a>
                              <span className="text-xs text-slate-400 ml-auto flex-shrink-0">
                                {formatDateTime(sub.submitted_at)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Case Study Answers */}
                    <section>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Case Study Answers
                      </h3>
                      {caseSubs.length === 0 ? (
                        <p className="text-sm text-slate-400">No case study answers submitted.</p>
                      ) : (
                        <div className="space-y-3">
                          {caseSubs.map((cs, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl px-4 py-3">
                              <p className="text-xs font-medium text-slate-500 mb-1">
                                Question {cs.question_index + 1}:
                                {mod.caseStudy.questions[cs.question_index] && (
                                  <span className="font-normal text-slate-400 ml-1">
                                    {mod.caseStudy.questions[cs.question_index].slice(0, 80)}
                                    {mod.caseStudy.questions[cs.question_index].length > 80
                                      ? '...'
                                      : ''}
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-slate-700">{cs.answer}</p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {formatDateTime(cs.submitted_at)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Quiz Attempts */}
                    <section>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Quiz Attempts ({quizAttempts.length})
                      </h3>
                      {quizAttempts.length === 0 ? (
                        <p className="text-sm text-slate-400">No quiz attempts.</p>
                      ) : (
                        <div className="space-y-4">
                          {quizAttempts.map((attempt) => {
                            const essayQuestions = mod.quiz.filter(
                              (q) => q.type === 'essay',
                            );

                            return (
                              <div
                                key={attempt.id}
                                className="border border-slate-200 rounded-xl overflow-hidden"
                              >
                                {/* Attempt header */}
                                <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                                  <div className="text-sm">
                                    <span className="font-medium text-slate-900">
                                      Attempt on {formatDateTime(attempt.created_at)}
                                    </span>
                                  </div>
                                  <span
                                    className={clsx(
                                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                                      attempt.score != null
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'bg-amber-50 text-amber-700',
                                    )}
                                  >
                                    {attempt.score != null ? `${attempt.score}%` : 'Pending'}
                                  </span>
                                </div>

                                {/* MC answers summary */}
                                <div className="px-4 py-3 space-y-2">
                                  {mod.quiz
                                    .filter((q) => q.type === 'multiple-choice')
                                    .map((q) => {
                                      const studentAnswer = attempt.answers[String(q.id)];
                                      const isCorrect = studentAnswer === q.answer;
                                      return (
                                        <div
                                          key={q.id}
                                          className="flex items-start gap-2 text-sm"
                                        >
                                          {isCorrect ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                          ) : (
                                            <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                              <span className="text-[8px] font-bold text-red-500">
                                                X
                                              </span>
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-slate-700 truncate">
                                              {q.question.slice(0, 100)}
                                              {q.question.length > 100 ? '...' : ''}
                                            </p>
                                            {!isCorrect && studentAnswer && (
                                              <p className="text-xs text-slate-400">
                                                Answered: {studentAnswer} (Correct: {q.answer})
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>

                                {/* Essay grading */}
                                {essayQuestions.length > 0 && (
                                  <div className="border-t border-slate-100 px-4 py-3 space-y-4">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                      Essay Answers
                                    </p>
                                    {essayQuestions.map((q) => {
                                      const key = `${attempt.id}-${q.id}`;
                                      const studentAnswer = attempt.answers[String(q.id)] ?? '';
                                      const localGrade = essayGrades[key] ?? {
                                        grade: '',
                                        feedback: '',
                                      };
                                      const isSaving = savingEssay === key;
                                      const isSaved = savedEssay.has(key);

                                      return (
                                        <div
                                          key={q.id}
                                          className="bg-slate-50 rounded-xl px-4 py-3 space-y-3"
                                        >
                                          <p className="text-sm font-medium text-slate-700">
                                            {q.question}
                                          </p>
                                          <div className="bg-white rounded-lg px-3 py-2 text-sm text-slate-600 border border-slate-200">
                                            {studentAnswer || (
                                              <span className="text-slate-400 italic">
                                                No answer provided
                                              </span>
                                            )}
                                          </div>

                                          {/* Reference answer */}
                                          {q.answer && (
                                            <details className="text-xs">
                                              <summary className="text-indigo-600 cursor-pointer hover:text-indigo-800 font-medium">
                                                Show reference answer
                                              </summary>
                                              <p className="mt-1 text-slate-500 bg-indigo-50 rounded-lg px-3 py-2">
                                                {q.answer}
                                              </p>
                                            </details>
                                          )}

                                          {/* Grade input */}
                                          <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-shrink-0">
                                              <label className="block text-xs font-medium text-slate-500 mb-1">
                                                Grade (0-100)
                                              </label>
                                              <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={localGrade.grade}
                                                onChange={(e) =>
                                                  updateEssayField(key, 'grade', e.target.value)
                                                }
                                                className="w-24 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="0-100"
                                              />
                                            </div>
                                            <div className="flex-1">
                                              <label className="block text-xs font-medium text-slate-500 mb-1">
                                                Feedback
                                              </label>
                                              <textarea
                                                value={localGrade.feedback}
                                                onChange={(e) =>
                                                  updateEssayField(
                                                    key,
                                                    'feedback',
                                                    e.target.value,
                                                  )
                                                }
                                                rows={2}
                                                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                                placeholder="Optional feedback..."
                                              />
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => handleSaveGrade(attempt.id, q.id)}
                                              disabled={isSaving || !localGrade.grade}
                                              className={clsx(
                                                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                                                isSaving || !localGrade.grade
                                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                  : 'bg-indigo-600 text-white hover:bg-indigo-700',
                                              )}
                                            >
                                              {isSaving ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                              ) : (
                                                <Save className="w-3 h-3" />
                                              )}
                                              {isSaving ? 'Saving...' : 'Save'}
                                            </button>
                                            {isSaved && (
                                              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Saved
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
