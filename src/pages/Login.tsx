import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Shield, Camera, User, LogIn, KeyRound, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COURSES } from '../data/courses';
import type { CourseId } from '../data/courses';
import { FaceRegistration } from '../components/FaceRegistration';
import clsx from 'clsx';

type LoginStep = 0 | 1 | 'face-register';

export const Login = () => {
  const [step, setStep] = useState<LoginStep>(0);
  const [selectedCourse, setSelectedCourse] = useState<CourseId>('infosec');
  const [mode, setMode] = useState<'student' | 'lecturer'>('student');
  const [studentId, setStudentId] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [faceAttempt, setFaceAttempt] = useState(1);
  const [faceRegistered, setFaceRegistered] = useState<boolean | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const { login, lecturerLogin } = useAuth();

  // Fetch CSRF cookie on mount so login POSTs succeed
  useEffect(() => {
    fetch('/api/auth/csrf', { credentials: 'include' }).catch(() => {});
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
    }
  }, [webcamRef]);

  const handleCourseSelect = (courseId: CourseId) => {
    setSelectedCourse(courseId);
    localStorage.setItem('selected_course', courseId);
    setStep(1);
  };

  const checkFaceStatus = async (nim: string) => {
    try {
      const res = await fetch(`/api/face/status/${encodeURIComponent(nim)}`, {
        credentials: 'include',
      });
      if (!res.ok) return { registered: false, enrolled: false };
      return await res.json() as { registered: boolean; enrolled: boolean };
    } catch {
      return { registered: false, enrolled: false };
    }
  };

  const handleNimSubmit = async () => {
    if (!studentId.trim()) return;
    setError('');
    const status = await checkFaceStatus(studentId.trim());

    if (!status.enrolled && !status.registered) {
      // Not in system at all — will be blocked at login, show early
      setError('NIM tidak terdaftar. Hubungi dosen untuk pendaftaran.');
      return;
    }

    setFaceRegistered(status.registered);

    if (!status.registered) {
      // Enrolled but face not yet registered — go to registration wizard
      setStep('face-register');
    }
    // If registered, stay on step 1 for single-photo verification login
  };

  const handleFaceRegistrationComplete = async () => {
    // After successful face registration, auto-login (skip face verify since just registered)
    setError('');
    setSubmitting(true);
    try {
      await login(studentId, '', undefined, true);
    } catch (err: any) {
      setStep(1);
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !photo) return;
    setError('');
    setSubmitting(true);
    try {
      await login(studentId, photo, faceAttempt);
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      if (msg.includes('Wajah tidak cocok') || msg.includes('Wajah kurang cocok')) {
        setFaceAttempt((prev) => prev + 1);
        setPhoto(null);
      }
      if (msg.includes('Verifikasi gagal setelah')) {
        // Max attempts reached
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLecturerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setError('');
    setSubmitting(true);
    try {
      await lecturerLogin(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 0: Course Picker
  if (step === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-lg w-full">
          <div className="bg-indigo-600 p-8 text-center">
            <div className="bg-white rounded-2xl p-3 inline-flex items-center justify-center mx-auto mb-4 shadow-md">
              <img src="/logo.png" alt="Bina Insani" className="h-12 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white">Bina Insani LMS</h1>
            <p className="text-indigo-100 text-sm mt-1">Universitas Bina Insani</p>
          </div>

          <div className="p-8">
            <h2 className="text-lg font-bold text-slate-900 text-center mb-2">Pilih Mata Kuliah</h2>
            <p className="text-sm text-slate-500 text-center mb-6">Pilih mata kuliah yang ingin Anda akses</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.values(COURSES) as typeof COURSES[CourseId][]).map((course) => (
                <button
                  key={course.id}
                  onClick={() => handleCourseSelect(course.id)}
                  className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                >
                  <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                    {course.id === 'infosec' ? (
                      <Shield className="w-7 h-7 text-indigo-600" />
                    ) : (
                      <Lock className="w-7 h-7 text-indigo-600" />
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 leading-tight">{course.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{course.meetingCount} Pertemuan</p>
                  <p className="text-xs text-slate-400">{course.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:gap-2 transition-all">
                    Pilih <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-400 text-center mt-6">
              Dosen dapat login ke semua mata kuliah dari halaman berikutnya
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step: Face Registration
  if (step === 'face-register') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full">
          <div className="bg-indigo-600 p-6 text-center">
            <div className="bg-white rounded-2xl p-3 inline-flex items-center justify-center mx-auto mb-4 shadow-md">
              <img src="/logo.png" alt="Bina Insani" className="h-10 w-auto object-contain" />
            </div>
            <h1 className="text-xl font-bold text-white">Registrasi Wajah</h1>
            <p className="text-indigo-100 text-sm mt-1">NIM: {studentId}</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <p className="text-sm text-slate-500 text-center mb-4">
              Ambil 3 foto wajah untuk verifikasi identitas di login berikutnya.
            </p>

            <FaceRegistration
              studentId={studentId}
              onComplete={handleFaceRegistrationComplete}
              onError={(msg) => setError(msg)}
            />

            <button
              type="button"
              onClick={() => { setStep(1); setError(''); }}
              className="w-full mt-4 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Lewati registrasi wajah
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Login Form
  const courseName = COURSES[selectedCourse].name;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full">
        <div className="bg-indigo-600 p-6 text-center">
          <div className="bg-white rounded-2xl p-3 inline-flex items-center justify-center mx-auto mb-4 shadow-md">
            <img src="/logo.png" alt="Bina Insani" className="h-10 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'student' ? 'Student Login' : 'Lecturer Login'}
          </h1>
          <p className="text-indigo-100 text-sm mt-1">Bina Insani LMS</p>
          {mode === 'student' && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
              {selectedCourse === 'infosec' ? <Shield className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {courseName}
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => { setMode('student'); setError(''); }}
            className={clsx(
              "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              mode === 'student'
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <User className="w-4 h-4" /> Student
          </button>
          <button
            type="button"
            onClick={() => { setMode('lecturer'); setError(''); }}
            className={clsx(
              "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              mode === 'lecturer'
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <KeyRound className="w-4 h-4" /> Lecturer
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {mode === 'student' ? (
            <form onSubmit={handleStudentLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Student ID (NIM)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Masukkan NIM (contoh: 2024001)"
                    required
                  />
                </div>
              </div>

              {/* Face status check button - only show if not yet checked */}
              {faceRegistered === null && (
                <button
                  type="button"
                  onClick={handleNimSubmit}
                  disabled={!studentId.trim()}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  Lanjutkan
                </button>
              )}

              {/* Webcam section - show after face status is checked */}
              {faceRegistered !== null && (
                <>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">
                      {faceRegistered ? 'Verifikasi Wajah' : 'Foto Kehadiran'}
                      {faceRegistered && faceAttempt > 1 && (
                        <span className="ml-2 text-xs text-amber-600 font-normal">
                          (Percobaan {faceAttempt}/3)
                        </span>
                      )}
                    </label>
                    <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-video border-2 border-dashed border-slate-300 flex items-center justify-center group">
                      {photo ? (
                        <div className="relative w-full h-full">
                          <img src={photo} alt="Captured" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhoto(null)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-full relative">
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={capture}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-indigo-600 px-4 py-2 rounded-full font-medium shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Ambil Foto
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      {faceRegistered
                        ? 'Pastikan wajah Anda terlihat jelas untuk verifikasi identitas.'
                        : 'Pastikan wajah Anda terlihat jelas untuk pencatatan kehadiran.'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!studentId || !photo || submitting}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    {submitting ? 'Masuk...' : 'Login ke Kursus'}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setStep(0)}
                className="w-full text-sm text-slate-500 hover:text-indigo-600 transition-colors"
              >
                ← Kembali pilih mata kuliah
              </button>
            </form>
          ) : (
            <form onSubmit={handleLecturerLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Masukkan username"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!username || !password || submitting}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                {submitting ? 'Masuk...' : 'Login sebagai Dosen'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
