import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Save, RotateCcw, Check } from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../lib/api';
import { syllabusData } from '../../data/syllabus-data';
import { cryptoSyllabusData } from '../../data/crypto-syllabus-data';
import { COURSES } from '../../data/courses';
import type { ModuleData, TheoryItem, VideoResource, LabStep, QuizQuestion } from '../../data/syllabus-data';

interface ContentEditorTabProps {
  isActive: boolean;
}

export const ContentEditorTab: React.FC<ContentEditorTabProps> = ({ isActive }) => {
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

  useEffect(() => {
    if (!isActive) return;
    api<{ overrides: { module_id: number }[] }>('/api/content')
      .then(data => setOverrideStatuses(new Set(data.overrides.map(o => o.module_id))))
      .catch(() => {});
  }, [isActive]);

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
    if (isActive) loadModuleForEdit(selectedModuleId);
  }, [isActive, selectedModuleId, loadModuleForEdit]);

  const handleSelectModule = (moduleId: number) => {
    if (isDirty && !window.confirm('Ada perubahan yang belum disimpan. Lanjutkan?')) return;
    setSelectedModuleId(moduleId);
    setContentEditorTab('materi');
  };

  const markDirty = () => setIsDirty(true);

  const handleSave = async () => {
    if (!editData) return;
    try {
      await api(`/api/content/${selectedModuleId}`, { method: 'PUT', body: JSON.stringify(editData) });
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
      setOverrideStatuses(prev => { const next = new Set(prev); next.delete(selectedModuleId); return next; });
      loadModuleForEdit(selectedModuleId);
      showToast('Konten direset ke default');
    } catch (e: unknown) {
      showToast((e as Error).message || 'Gagal mereset');
    }
  };

  return (
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
                  handleSelectModule(c === 'infosec' ? 1 : 101);
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
                  selectedModuleId === m.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
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
              <div className="flex gap-1 px-4 pt-4 border-b border-slate-100 pb-0">
                {([
                  { key: 'materi', label: 'Materi' },
                  { key: 'video', label: 'Video' },
                  { key: 'lab', label: 'Lab' },
                  { key: 'studi', label: 'Studi Kasus' },
                  { key: 'quiz', label: 'Quiz' },
                ] as const).map(t => (
                  <button
                    key={t.key}
                    onClick={() => setContentEditorTab(t.key)}
                    className={clsx(
                      'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative top-px',
                      contentEditorTab === t.key ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-6">
                {contentEditorTab === 'materi' && (
                  <MateriEditor editData={editData} setEditData={setEditData} markDirty={markDirty} />
                )}
                {contentEditorTab === 'video' && (
                  <VideoEditor editData={editData} setEditData={setEditData} markDirty={markDirty} />
                )}
                {contentEditorTab === 'lab' && (
                  <LabEditor editData={editData} setEditData={setEditData} markDirty={markDirty} />
                )}
                {contentEditorTab === 'studi' && (
                  <CaseStudyEditor editData={editData} setEditData={setEditData} markDirty={markDirty} />
                )}
                {contentEditorTab === 'quiz' && (
                  <QuizEditor editData={editData} setEditData={setEditData} markDirty={markDirty} />
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={clsx(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                      isDirty ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    )}
                  >
                    <Save className="w-4 h-4" /> Simpan Perubahan
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset ke Default
                  </button>
                  {isDirty && <span className="text-xs text-amber-600 font-medium">Ada perubahan belum disimpan</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// --- Sub-editors ---

interface EditorProps {
  editData: ModuleData;
  setEditData: React.Dispatch<React.SetStateAction<ModuleData | null>>;
  markDirty: () => void;
}

const MateriEditor: React.FC<EditorProps> = ({ editData, setEditData, markDirty }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-slate-900">Teori / Konsep Kunci</h3>
      <button
        onClick={() => { setEditData(prev => prev ? { ...prev, theory: [...prev.theory, { title: '', content: '' }] } : prev); markDirty(); }}
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
              const t = [...editData.theory]; t[idx] = { ...t[idx], title: e.target.value };
              setEditData({ ...editData, theory: t }); markDirty();
            }}
          />
          <button onClick={() => { setEditData({ ...editData, theory: editData.theory.filter((_, i) => i !== idx) }); markDirty(); }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <textarea
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Isi penjelasan..." rows={4} value={item.content}
          onChange={e => {
            const t = [...editData.theory]; t[idx] = { ...t[idx], content: e.target.value };
            setEditData({ ...editData, theory: t }); markDirty();
          }}
        />
      </div>
    ))}
  </div>
);

const VideoEditor: React.FC<EditorProps> = ({ editData, setEditData, markDirty }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-slate-900">Sumber Video</h3>
      <button
        onClick={() => {
          setEditData(prev => prev ? { ...prev, videoResources: [...prev.videoResources, { title: '', youtubeId: '', description: '', language: 'id', duration: '' }] } : prev);
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
            placeholder="Judul video" value={v.title}
            onChange={e => {
              const vids = [...editData.videoResources]; vids[idx] = { ...vids[idx], title: e.target.value };
              setEditData({ ...editData, videoResources: vids }); markDirty();
            }}
          />
          <button onClick={() => { setEditData({ ...editData, videoResources: editData.videoResources.filter((_, i) => i !== idx) }); markDirty(); }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">YouTube ID</label>
            <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. dQw4w9WgXcQ" value={v.youtubeId}
              onChange={e => { const vids = [...editData.videoResources]; vids[idx] = { ...vids[idx], youtubeId: e.target.value }; setEditData({ ...editData, videoResources: vids }); markDirty(); }}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Durasi</label>
            <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 15:30" value={v.duration ?? ''}
              onChange={e => { const vids = [...editData.videoResources]; vids[idx] = { ...vids[idx], duration: e.target.value }; setEditData({ ...editData, videoResources: vids }); markDirty(); }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Bahasa</label>
            <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={v.language ?? 'id'}
              onChange={e => { const vids = [...editData.videoResources]; vids[idx] = { ...vids[idx], language: e.target.value as 'id' | 'en' }; setEditData({ ...editData, videoResources: vids }); markDirty(); }}
            >
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Deskripsi</label>
            <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Deskripsi singkat" value={v.description ?? ''}
              onChange={e => { const vids = [...editData.videoResources]; vids[idx] = { ...vids[idx], description: e.target.value }; setEditData({ ...editData, videoResources: vids }); markDirty(); }}
            />
          </div>
        </div>
      </div>
    ))}
    {editData.videoResources.length === 0 && (
      <p className="text-sm text-slate-400 text-center py-8">Belum ada video. Klik Tambah untuk menambahkan.</p>
    )}
  </div>
);

const LabEditor: React.FC<EditorProps> = ({ editData, setEditData, markDirty }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-slate-900">Lab Exercise</h3>
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1 block">Judul Lab</label>
      <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" value={editData.lab.title}
        onChange={e => { setEditData({ ...editData, lab: { ...editData.lab, title: e.target.value } }); markDirty(); }}
      />
    </div>
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1 block">Deliverable</label>
      <textarea className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} value={editData.lab.deliverable}
        onChange={e => { setEditData({ ...editData, lab: { ...editData.lab, deliverable: e.target.value } }); markDirty(); }}
      />
    </div>
    <div className="flex items-center justify-between pt-2">
      <h4 className="text-sm font-semibold text-slate-700">Langkah-langkah</h4>
      <button
        onClick={() => { const steps = [...editData.lab.steps, { title: '', description: '' }]; setEditData({ ...editData, lab: { ...editData.lab, steps } }); markDirty(); }}
        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
      >
        <Plus className="w-4 h-4" /> Tambah Step
      </button>
    </div>
    {editData.lab.steps.map((step: LabStep, idx: number) => (
      <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
          <input className="flex-1 text-sm font-semibold border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Judul step" value={step.title}
            onChange={e => { const steps = [...editData.lab.steps]; steps[idx] = { ...steps[idx], title: e.target.value }; setEditData({ ...editData, lab: { ...editData.lab, steps } }); markDirty(); }}
          />
          <button onClick={() => { const steps = editData.lab.steps.filter((_, i) => i !== idx); setEditData({ ...editData, lab: { ...editData.lab, steps } }); markDirty(); }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <textarea className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Deskripsi" rows={2} value={step.description}
          onChange={e => { const steps = [...editData.lab.steps]; steps[idx] = { ...steps[idx], description: e.target.value }; setEditData({ ...editData, lab: { ...editData.lab, steps } }); markDirty(); }}
        />
        <input className="w-full text-sm font-mono border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-900 text-emerald-400" placeholder="Command (opsional)" value={step.command ?? ''}
          onChange={e => { const steps = [...editData.lab.steps]; steps[idx] = { ...steps[idx], command: e.target.value || undefined }; setEditData({ ...editData, lab: { ...editData.lab, steps } }); markDirty(); }}
        />
      </div>
    ))}
  </div>
);

const CaseStudyEditor: React.FC<EditorProps> = ({ editData, setEditData, markDirty }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-slate-900">Studi Kasus</h3>
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1 block">Skenario</label>
      <textarea className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" rows={5} value={editData.caseStudy.scenario}
        onChange={e => { setEditData({ ...editData, caseStudy: { ...editData.caseStudy, scenario: e.target.value } }); markDirty(); }}
      />
    </div>
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-semibold text-slate-700">Pertanyaan Diskusi</h4>
      <button
        onClick={() => { const questions = [...editData.caseStudy.questions, '']; setEditData({ ...editData, caseStudy: { ...editData.caseStudy, questions } }); markDirty(); }}
        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
      >
        <Plus className="w-4 h-4" /> Tambah
      </button>
    </div>
    {editData.caseStudy.questions.map((q: string, idx: number) => (
      <div key={idx} className="flex gap-2">
        <span className="text-sm text-slate-400 font-bold pt-2">Q{idx + 1}.</span>
        <input className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Pertanyaan..." value={q}
          onChange={e => { const questions = [...editData.caseStudy.questions]; questions[idx] = e.target.value; setEditData({ ...editData, caseStudy: { ...editData.caseStudy, questions } }); markDirty(); }}
        />
        <button onClick={() => { const questions = editData.caseStudy.questions.filter((_, i) => i !== idx); setEditData({ ...editData, caseStudy: { ...editData.caseStudy, questions } }); markDirty(); }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
);

const QuizEditor: React.FC<EditorProps> = ({ editData, setEditData, markDirty }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-slate-900">Soal Quiz</h3>
      <button
        onClick={() => {
          const maxId = editData.quiz.reduce((m: number, q: QuizQuestion) => Math.max(m, q.id), 0);
          const quiz = [...editData.quiz, { id: maxId + 1, question: '', type: 'multiple-choice' as const, options: ['', '', '', ''], answer: '' }];
          setEditData({ ...editData, quiz }); markDirty();
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
            <textarea className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Pertanyaan..." rows={2} value={q.question}
              onChange={e => { const quiz = [...editData.quiz]; quiz[idx] = { ...quiz[idx], question: e.target.value }; setEditData({ ...editData, quiz }); markDirty(); }}
            />
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-500">Tipe:</label>
              <select className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={q.type}
                onChange={e => {
                  const quiz = [...editData.quiz];
                  const type = e.target.value as 'multiple-choice' | 'essay';
                  quiz[idx] = { ...quiz[idx], type, options: type === 'multiple-choice' ? (quiz[idx].options ?? ['', '', '', '']) : undefined };
                  setEditData({ ...editData, quiz }); markDirty();
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
                    <input className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={`Opsi ${String.fromCharCode(65 + oi)}`} value={opt}
                      onChange={e => { const quiz = [...editData.quiz]; const options = [...(quiz[idx].options ?? [])]; options[oi] = e.target.value; quiz[idx] = { ...quiz[idx], options }; setEditData({ ...editData, quiz }); markDirty(); }}
                    />
                  </div>
                ))}
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                {q.type === 'multiple-choice' ? 'Jawaban benar (A/B/C/D atau teks opsi)' : 'Referensi jawaban essay'}
              </label>
              <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Jawaban..." value={q.answer}
                onChange={e => { const quiz = [...editData.quiz]; quiz[idx] = { ...quiz[idx], answer: e.target.value }; setEditData({ ...editData, quiz }); markDirty(); }}
              />
            </div>
          </div>
          <button onClick={() => { setEditData({ ...editData, quiz: editData.quiz.filter((_, i) => i !== idx) }); markDirty(); }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    ))}
  </div>
);
