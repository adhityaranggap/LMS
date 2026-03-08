import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Loader2, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { useChatbot } from '../context/ChatbotContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Render formatted message content (bold, code blocks, lists)
const MessageContent: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  const parts: React.ReactNode[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      parts.push(
        <pre key={parts.length} className="bg-slate-900 text-emerald-400 rounded-lg p-3 my-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
          {codeLines.join('\n')}
        </pre>
      );
      i++;
      continue;
    }

    // Bullet point
    if (line.match(/^[-*•]\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*•]\s/)) {
        items.push(lines[i].replace(/^[-*•]\s/, ''));
        i++;
      }
      parts.push(
        <ul key={parts.length} className="my-2 space-y-1 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-sm leading-relaxed">
              <span className={clsx('mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0', isUser ? 'bg-indigo-200' : 'bg-indigo-400')} />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      parts.push(
        <ol key={parts.length} className="my-2 space-y-1 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-sm leading-relaxed">
              <span className={clsx('flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold', isUser ? 'bg-indigo-400/30 text-white' : 'bg-indigo-100 text-indigo-600')}>
                {idx + 1}
              </span>
              <span className="pt-0.5">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line → separator
    if (line.trim() === '') {
      if (parts.length > 0) {
        parts.push(<div key={parts.length} className="h-1.5" />);
      }
      i++;
      continue;
    }

    // Normal paragraph
    parts.push(
      <p key={parts.length} className="text-sm leading-relaxed">{renderInline(line)}</p>
    );
    i++;
  }

  return <div className="space-y-0.5">{parts}</div>;
};

function renderInline(text: string): React.ReactNode {
  // Split by **bold** and `code`
  const segments = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return segments.map((seg, idx) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return <strong key={idx} className="font-semibold">{seg.slice(2, -2)}</strong>;
    }
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return <code key={idx} className="bg-black/20 px-1 py-0.5 rounded text-xs font-mono">{seg.slice(1, -1)}</code>;
    }
    return seg;
  });
}

const SUGGESTED_INFOSEC = [
  'Apa itu SYN Flood?',
  'Jelaskan RBAC vs ABAC',
  'Cara pakai tshark untuk capture?',
];

const SUGGESTED_CRYPTO = [
  'Jelaskan Avalanche Effect pada AES',
  'Mengapa OTP memiliki perfect secrecy?',
  'Bagaimana RSA menggunakan modular arithmetic?',
];

// Quiz questions loaded dynamically from course data to avoid hardcoding
let cachedQuizQuestions: string[] | null = null;

async function loadQuizQuestions(): Promise<string[]> {
  if (cachedQuizQuestions) return cachedQuizQuestions;
  try {
    const [infosecMod, cryptoMod] = await Promise.all([
      import('../data/syllabus-data').then(m => m.syllabusData),
      import('../data/crypto-syllabus-data').then(m => m.cryptoSyllabusData),
    ]);
    const questions: string[] = [];
    for (const mod of [...infosecMod, ...cryptoMod]) {
      if (mod.quiz) {
        for (const q of mod.quiz) {
          questions.push(q.question.toLowerCase());
        }
      }
    }
    cachedQuizQuestions = questions;
    return questions;
  } catch {
    return [];
  }
}

// Pre-load on module init
loadQuizQuestions();

function isQuizQuestion(text: string): boolean {
  if (!cachedQuizQuestions) return false;
  const normalized = text.toLowerCase().trim();
  return cachedQuizQuestions.some(q => normalized.includes(q));
}

// Patterns that explicitly ask for direct assignment/quiz/case study answers.
const RESTRICTED_PATTERNS = [
  // Asking to do the assignment for them
  /kerjakan(kan)?\s+(tugas|lab|praktikum)/i,
  /tolong\s+(isi|kerjakan|selesaikan)\s+(tugas|lab|praktikum|studi\s+kasus)/i,
  /buatkan\s+(laporan\s+)?praktikum/i,

  // Asking for direct quiz / multiple-choice answers
  /jawaban\s+(quiz|ujian|soal\s+quiz)/i,
  /pilihan\s+(jawaban\s+)?(yang\s+)?(benar|correct)\s+(untuk\s+soal|quiz|nomor)/i,
  /jawab(i|kan)?\s+(soal|pertanyaan)\s+(nomor|no\.?)\s*\d/i,
  /option\s+[abcde]\s+(benar|correct|yang\s+dipilih)/i,

  // Asking for direct case study answer text
  /tuliskan\s+(jawaban|analisis)\s+(case\s+study|studi\s+kasus)/i,
  /buatkan\s+(jawaban|analisis)\s+(case\s+study|studi\s+kasus)/i,
  /isi(kan)?\s+(jawaban\s+)?studi\s+kasus/i,
];

const REFUSAL_MESSAGE = `Maaf, aku tidak bisa memberikan jawaban langsung untuk **tugas praktikum**, **quiz**, atau **studi kasus**.

Integritas akademik sangat penting! Namun aku dengan senang hati bisa:
- **Menjelaskan konsep** yang berkaitan agar kamu bisa menjawab sendiri
- **Memberikan contoh umum** di luar konteks soal spesifik kamu
- **Mengklarifikasi istilah** atau perintah yang belum dipahami

Coba tanyakan konsep atau teori yang ingin kamu pahami lebih dalam.`;

function isRestrictedRequest(text: string): boolean {
  return RESTRICTED_PATTERNS.some(pattern => pattern.test(text));
}

export const Chatbot: React.FC = () => {
  const { isOpen, openChat, closeChat, consumePending } = useChatbot();
  const { course } = useAuth();
  const isCrypto = course === 'crypto';
  const SUGGESTED = isCrypto ? SUGGESTED_CRYPTO : SUGGESTED_INFOSEC;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Consume pending message from context (triggered by "Ask AI" buttons)
  useEffect(() => {
    if (isOpen) {
      const pending = consumePending();
      if (pending) {
        setInput(pending);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        inputRef.current?.focus();
      }
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Client-side safeguard: block quiz questions and explicit cheat attempts
    if (isQuizQuestion(content) || isRestrictedRequest(content)) {
      setMessages(prev => [...prev, { role: 'assistant', content: REFUSAL_MESSAGE }]);
      return;
    }

    const updatedMessages = [...messages, userMessage];
    setLoading(true);
    setError(null);

    try {
      const data = await api<{ reply: string }>('/api/chatbot/query', {
        method: 'POST',
        body: JSON.stringify({
          course: isCrypto ? 'crypto' : 'infosec',
          messages: updatedMessages,
        }),
      });

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      setError(err.message ?? 'Gagal menghubungi AI. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const panelClass = fullScreen
    ? 'fixed inset-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden'
    : 'fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden';

  const panelStyle = fullScreen ? {} : { maxHeight: '70vh' };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => isOpen ? closeChat() : openChat()}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        aria-label="Toggle AI assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={panelClass}
            style={panelStyle}
          >
            {/* Header */}
            <div className="bg-indigo-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">Lecturer Assistant</p>
                <p className="text-indigo-200 text-xs">Universitas Bina Insani</p>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Clear conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setFullScreen(f => !f)}
                  className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title={fullScreen ? 'Exit full screen' : 'Full screen'}
                >
                  {fullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={closeChat}
                  className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.length === 0 && (
                <div className="text-center py-6 text-slate-400">
                  <Bot className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">Hai! Ada yang bisa dibantu?</p>
                  <p className="text-xs mt-1 text-slate-400">Tanya tentang materi InfoSec, perintah CLI, atau konsep keamanan.</p>
                  <div className="mt-4 space-y-2">
                    {SUGGESTED.map(q => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={clsx('flex gap-2 items-start', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={clsx(
                    'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
                    msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                  )}>
                    {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={clsx(
                    'max-w-[85%] px-3 py-2.5 rounded-2xl',
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  )}>
                    <MessageContent content={msg.content} isUser={msg.role === 'user'} />
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 items-start">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-3 py-2.5 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    <span className="text-xs text-slate-400">Sedang memproses...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 p-3 flex-shrink-0 bg-white">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tanya sesuatu... (Enter untuk kirim)"
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-h-32 overflow-y-auto"
                  style={{ lineHeight: '1.5' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="flex-shrink-0 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 text-center">Shift+Enter untuk baris baru</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
