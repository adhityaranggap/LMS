import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { syllabus } from '../data/syllabus';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Award, BookOpen, CheckCircle2, Lock, Key, Cpu, Circle } from 'lucide-react';
import { ProgressRing } from '../components/ProgressRing';
import { useProgressSummary } from '../hooks/useProgress';
import { useAuth } from '../context/AuthContext';
import { cryptoSyllabusData } from '../data/crypto-syllabus-data';
import { COURSES } from '../data/courses';

// Icon map for crypto modules
const cryptoIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Key,
  Lock,
  Cpu,
  FileCode: BookOpen, // fallback to BookOpen
};

export const Home = () => {
  const { course } = useAuth();
  const { summary } = useProgressSummary();
  const isCrypto = course === 'crypto';
  const courseInfo = COURSES[course ?? 'infosec'];

  const getModuleProgress = (moduleId: number) => {
    const m = summary.find(s => s.moduleId === moduleId);
    if (!m) return 0;
    let score = 0;
    const total = isCrypto ? 4 : 5; // crypto: theory+lab+case+quiz (no separate videos tab)
    if (m.visitedTabs.length > 0) score += 1;
    if (m.labStepsCompleted > 0) score += 1;
    if (m.labSubmitted) score += 1;
    if (m.caseSubmitted) score += 1;
    if (!isCrypto && m.quizAttempts > 0) score += 1;
    return Math.round((score / total) * 100);
  };

  const getModuleChecklist = (moduleId: number) => {
    const m = summary.find(s => s.moduleId === moduleId);
    return {
      theory: !!(m && m.visitedTabs.includes('theory')),
      lab: !!(m && m.labStepsCompleted > 0),
      caseStudy: !!(m && m.caseSubmitted),
      quiz: !!(m && m.quizAttempts > 0 && (m.bestScore ?? 0) >= 70),
    };
  };

  const overallProgress = useMemo(() => {
    if (summary.length === 0) return 0;
    const totalModules = isCrypto ? cryptoSyllabusData.length : syllabus.length;
    if (totalModules === 0) return 0;
    const totalProgress = (isCrypto ? cryptoSyllabusData : syllabus).reduce((sum, mod) => {
      return sum + getModuleProgress(mod.id);
    }, 0);
    return Math.round(totalProgress / totalModules);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary, isCrypto]);

  // Build module list based on course
  const modules = isCrypto
    ? cryptoSyllabusData.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        icon: cryptoIconMap[m.iconName] ?? Key,
        displayIndex: m.id - 100, // 101→1, 102→2, etc.
      }))
    : syllabus.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        icon: m.icon,
        displayIndex: m.id,
      }));

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-12">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-indigo-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {isCrypto ? 'Semester 4 • 3 SKS' : 'Semester 6 • 3 SKS'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
            {courseInfo.name}
            {isCrypto && (
              <span className="block text-indigo-400 text-2xl md:text-3xl mt-2 font-normal">(Cryptography)</span>
            )}
            {!isCrypto && (
              <span className="block text-indigo-400 text-2xl md:text-3xl mt-2 font-normal">(Information Security Testing)</span>
            )}
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl">
            {isCrypto
              ? 'Pelajari dasar-dasar kriptografi, sandi klasik, algoritma modern, dan aplikasinya dalam keamanan informasi di Universitas Bina Insani.'
              : 'Panduan lengkap pengajaran untuk mahasiswa Teknik Informatika Universitas Bina Insani. Pelajari cara mendeteksi, menganalisis, dan menangani ancaman cybersecurity menggunakan tools industri.'}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to={`/module/${modules[0]?.id}`}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/20"
            >
              Mulai Belajar <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#modules"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all backdrop-blur-sm"
            >
              Lihat Silabus
            </a>
          </div>
        </div>
      </section>

      {/* Stats / Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{courseInfo.meetingCount} Pertemuan</h3>
          <p className="text-slate-500 mt-2 text-sm">
            {isCrypto
              ? 'Mencakup sandi klasik, mode operasi blok, dan kriptografi kunci publik.'
              : 'Struktur komprehensif mencakup teori, lab praktik, dan studi kasus nyata.'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {isCrypto ? 'Lab & Interaktif' : 'Hands-on Labs'}
          </h3>
          <p className="text-slate-500 mt-2 text-sm">
            {isCrypto
              ? 'Implementasi cipher dalam Python dan alat kriptografi interaktif.'
              : 'Praktik langsung menggunakan CyberOps Workstation, Security Onion, dan Wireshark.'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-4">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {isCrypto ? 'Studi Kasus Nyata' : 'Case Studies'}
          </h3>
          <p className="text-slate-500 mt-2 text-sm">
            {isCrypto
              ? 'Analisis kasus kebocoran data dan implementasi kriptografi yang salah.'
              : 'Analisis insiden nyata seperti Ransomware, DDoS, dan APT attacks.'}
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      {summary.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Progress Keseluruhan</h3>
            <span className="text-sm font-bold text-indigo-600">{overallProgress}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Modules Grid */}
      <section id="modules">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {isCrypto ? 'Modul Kriptografi' : 'Learning Modules'}
          </h2>
          <span className="text-sm text-slate-500 font-medium">{modules.length} Modul Tersedia</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module, index) => {
            const progress = getModuleProgress(module.id);
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/module/${module.id}`}
                  className="group block bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <module.icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-3">
                      {progress > 0 && <ProgressRing progress={progress} />}
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Pertemuan {module.displayIndex}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                    {module.description}
                  </p>
                  {progress > 0 && progress < 100 && (() => {
                    const cl = getModuleChecklist(module.id);
                    return (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 text-xs">
                        {[
                          { done: cl.theory, label: 'Teori' },
                          { done: cl.lab, label: 'Lab' },
                          { done: cl.caseStudy, label: 'Studi Kasus' },
                          { done: cl.quiz, label: 'Quiz' },
                        ].map(item => (
                          <span key={item.label} className="flex items-center gap-1">
                            {item.done
                              ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              : <Circle className="w-3 h-3 text-slate-300" />}
                            <span className={item.done ? 'text-emerald-600' : 'text-slate-400'}>{item.label}</span>
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400 group-hover:text-indigo-600 transition-colors">
                    {progress >= 100 ? (
                      <><CheckCircle2 className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600">Selesai</span></>
                    ) : (
                      <><span>Lihat Materi</span><ArrowRight className="w-3 h-3" /></>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
