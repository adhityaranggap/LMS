import React, { useState, useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Terminal, Briefcase, HelpCircle, CheckCircle2, Search, Download, Send, Play, AlertTriangle, Lightbulb, Camera, FileText, MessageCircle, Cpu } from 'lucide-react';
import { Quiz } from '../components/Quiz';
import { RichTheoryItem } from '../components/RichTheoryItem';
import { VideoSection } from '../components/VideoSection';
import { CryptoTools } from '../components/CryptoTools';
import { useLabSteps, useCaseSubmission, recordVisit } from '../hooks/useProgress';
import { useModuleContent } from '../hooks/useModuleContent';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import clsx from 'clsx';
import { useChatbot } from '../context/ChatbotContext';

export const ModuleDetail = () => {
  const { id } = useParams();
  const { module, loading } = useModuleContent(Number(id));
  const { openChat } = useChatbot();
  const { course } = useAuth();
  const isCrypto = course === 'crypto';
  const [activeTab, setActiveTab] = useState<'theory' | 'lab' | 'case' | 'quiz' | 'videos' | 'interactive'>('theory');
  const [labSubmitted, setLabSubmitted] = useState(false);
  const [labFileName, setLabFileName] = useState('');
  const [labNotes, setLabNotes] = useState('');
  const [caseAnswers, setCaseAnswers] = useState<Record<number, string>>({});
  const prevTab = useRef(activeTab);

  const moduleId = Number(id) || 0;
  const { completedSteps, toggleStep } = useLabSteps(moduleId);
  const { submission: caseSubmission } = useCaseSubmission(moduleId);

  useEffect(() => {
    if (module && prevTab.current !== activeTab) {
      recordVisit(module.id, activeTab);
      prevTab.current = activeTab;
    }
  }, [activeTab, module]);

  // Record initial visit
  useEffect(() => {
    if (module) recordVisit(module.id, 'theory');
  }, [module]);

  // Load previous case answers
  useEffect(() => {
    if (caseSubmission) {
      try {
        const parsed = JSON.parse(caseSubmission.answers);
        setCaseAnswers(parsed);
      } catch {}
    }
  }, [caseSubmission]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
          <div className="h-8 w-2/3 bg-slate-200 rounded mb-6" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="h-6 w-40 bg-slate-200 rounded mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    return <Navigate to="/" replace />;
  }

  const cryptoHasInteractive = isCrypto && Number(id) !== 101;

  type TabId = 'theory' | 'lab' | 'case' | 'quiz' | 'videos' | 'interactive';
  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'theory', label: 'Teori', icon: BookOpen },
    { id: 'lab', label: 'Lab Exercise', icon: Terminal },
    { id: 'case', label: 'Studi Kasus', icon: Briefcase },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
    ...(cryptoHasInteractive ? [{ id: 'interactive' as TabId, label: 'Interaktif', icon: Cpu }] : []),
    { id: 'videos', label: 'Videos', icon: Play },
  ];

  const handleLabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api('/api/progress/lab-submit', {
        method: 'POST',
        body: JSON.stringify({ moduleId: module.id, fileName: labFileName, notes: labNotes }),
      });
      setLabSubmitted(true);
    } catch {}
  };

  const handleCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api('/api/progress/case-submit', {
        method: 'POST',
        body: JSON.stringify({ moduleId: module.id, answers: JSON.stringify(caseAnswers) }),
      });
    } catch {}
  };

  const caseAlreadySubmitted = !!caseSubmission;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-medium text-indigo-600 mb-4">
          <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
            Module {module.id}
          </span>
          <span className="text-slate-400">•</span>
          <span>{module.description}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
          {module.title}
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm font-medium transition-all relative top-px",
                activeTab === tab.id
                  ? "text-indigo-600 bg-indigo-50/50 border-b-2 border-indigo-600"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'theory' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Key Concepts
            </h2>
            <div className="space-y-6">
              {module.theory.map((item, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openChat(`Jelaskan konsep "${item.title}" dalam konteks ${isCrypto ? 'kriptografi' : 'keamanan informasi'}. Berikan contoh nyata dan praktis.`)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm"
                        title="Tanya AI tentang topik ini"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(item.title + (isCrypto ? " cryptography" : " cybersecurity"))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm"
                        title="Search for more info"
                      >
                        <Search className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="pl-11">
                    <RichTheoryItem item={item} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-500" />
                {module.lab.title}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium">
                  {completedSteps.length}/{module.lab.steps.length} steps
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                  HANDS-ON
                </span>
              </div>
            </div>

            {/* Downloads Section */}
            {module.lab.downloads.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Required Resources
                </h3>
                <div className="grid gap-3">
                  {module.lab.downloads.map((dl, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                      <div>
                        <div className="font-medium text-slate-900">{dl.name}</div>
                        <div className="text-xs text-slate-500">{dl.description}</div>
                      </div>
                      <a
                        href={dl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Steps Section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Step-by-Step Instructions
              </h3>
              <div className="space-y-6">
                {module.lab.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    <button
                      onClick={() => toggleStep(idx)}
                      className={clsx(
                        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono font-bold transition-colors border-2",
                        completedSteps.includes(idx)
                          ? "bg-emerald-100 text-emerald-600 border-emerald-300"
                          : "bg-slate-100 text-slate-500 border-transparent group-hover:border-emerald-200"
                      )}
                      title={completedSteps.includes(idx) ? "Mark incomplete" : "Mark complete"}
                    >
                      {completedSteps.includes(idx) ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </button>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900">{step.title}</h4>
                        <button
                          onClick={() => openChat(`Bantu aku dengan langkah lab: "${step.title}"\n\n${step.description}${step.command ? `\n\nCommand: ${step.command}` : ''}`)}
                          className="flex-shrink-0 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Tanya AI tentang langkah ini"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                      {step.command && (
                        <div className="bg-slate-900 rounded-lg p-3 mt-2 font-mono text-xs text-emerald-400 overflow-x-auto">
                          $ {step.command}
                        </div>
                      )}
                      {step.expectedOutput && (
                        <div className="bg-slate-50 rounded-lg p-3 mt-1 font-mono text-xs text-slate-500 border border-slate-200 italic">
                          Output: {step.expectedOutput}
                        </div>
                      )}
                      {step.hint && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2 text-sm text-amber-800 flex gap-2">
                          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{step.hint}</span>
                        </div>
                      )}
                      {step.screenshotNote && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 text-sm text-blue-800 flex gap-2">
                          <Camera className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{step.screenshotNote}</span>
                        </div>
                      )}
                      {step.warningNote && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2 text-sm text-red-800 flex gap-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{step.warningNote}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Section */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Deliverable & Submission
              </h3>
              <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm mb-4">
                {module.lab.deliverable}
              </p>

              {labSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Lab report submitted successfully!</span>
                </div>
              ) : (
                <form onSubmit={handleLabSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">File Name / Link</label>
                    <input
                      type="text"
                      value={labFileName}
                      onChange={e => setLabFileName(e.target.value)}
                      className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="e.g., lab9_report.pdf or Google Drive link"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Notes (optional)</label>
                    <textarea
                      value={labNotes}
                      onChange={e => setLabNotes(e.target.value)}
                      className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="Any additional notes..."
                      rows={3}
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Submit Lab Report
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === 'case' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-500" />
              {module.caseStudy.title}
            </h2>
            <div className="mb-8">
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 text-purple-900 leading-relaxed">
                {module.caseStudy.scenario}
              </div>
            </div>

            <form onSubmit={handleCaseSubmit}>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Discussion Questions
              </h3>
              <div className="grid gap-6 mb-8">
                {module.caseStudy.questions.map((q, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-200 hover:shadow-sm transition-shadow bg-slate-50/50">
                    <div className="flex gap-3 mb-3 items-start">
                      <span className="text-purple-600 font-bold flex-shrink-0">Q{idx + 1}.</span>
                      <p className="text-slate-800 font-medium flex-1">{q}</p>
                      <button
                        onClick={() => openChat(`Bantu aku memahami pertanyaan case study ini:\n\n"${q}"\n\nBerikan panduan cara menjawab pertanyaan ini, termasuk konsep kunci yang relevan.`)}
                        className="flex-shrink-0 p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Tanya AI tentang pertanyaan ini"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white"
                      placeholder="Write your analysis here..."
                      rows={4}
                      required
                      disabled={caseAlreadySubmitted}
                      value={caseAnswers[idx] || ''}
                      onChange={e => setCaseAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              {caseAlreadySubmitted ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Case study analysis submitted successfully!</span>
                </div>
              ) : (
                <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20">
                  <Send className="w-4 h-4" />
                  Submit Analysis
                </button>
              )}
            </form>
          </div>
        )}

        {activeTab === 'quiz' && (
          <Quiz questions={module.quiz} moduleId={module.id} />
        )}

        {activeTab === 'interactive' && (
          <CryptoTools moduleId={module.id} />
        )}

        {activeTab === 'videos' && (
          <VideoSection videos={module.videoResources} />
        )}
      </motion.div>
    </div>
  );
};
