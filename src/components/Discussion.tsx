import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Send, Trash2, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import clsx from 'clsx';

interface Thread {
  id: number;
  student_id: string;
  user_type: string;
  content: string;
  parent_id: number | null;
  created_at: string;
  is_lecturer: number;
  reply_count: number;
}

interface Reply {
  id: number;
  student_id: string;
  user_type: string;
  content: string;
  created_at: string;
  is_lecturer: number;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function Discussion({ moduleId }: { moduleId: number }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [expandedThread, setExpandedThread] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number, Reply[]>>({});
  const [replyContent, setReplyContent] = useState<Record<number, string>>({});

  const fetchThreads = useCallback(() => {
    setLoading(true);
    api<{ threads: Thread[]; total: number }>(`/api/discussions/${moduleId}`)
      .then(data => {
        setThreads(data.threads);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [moduleId]);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  const handlePost = async () => {
    if (!newPost.trim() || posting) return;
    setPosting(true);
    try {
      await api(`/api/discussions/${moduleId}`, {
        method: 'POST',
        body: JSON.stringify({ content: newPost.trim() }),
      });
      setNewPost('');
      fetchThreads();
    } catch {}
    setPosting(false);
  };

  const handleReply = async (threadId: number) => {
    const content = replyContent[threadId]?.trim();
    if (!content) return;
    try {
      await api(`/api/discussions/${moduleId}`, {
        method: 'POST',
        body: JSON.stringify({ content, parent_id: threadId }),
      });
      setReplyContent(prev => ({ ...prev, [threadId]: '' }));
      loadReplies(threadId);
      fetchThreads();
    } catch {}
  };

  const loadReplies = async (threadId: number) => {
    try {
      const data = await api<{ replies: Reply[] }>(`/api/discussions/${moduleId}/${threadId}/replies`);
      setReplies(prev => ({ ...prev, [threadId]: data.replies }));
    } catch {}
  };

  const toggleThread = (threadId: number) => {
    if (expandedThread === threadId) {
      setExpandedThread(null);
    } else {
      setExpandedThread(threadId);
      if (!replies[threadId]) loadReplies(threadId);
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      await api(`/api/discussions/${postId}`, { method: 'DELETE' });
      fetchThreads();
    } catch {}
  };

  const isLecturer = user?.role !== 'student';

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-indigo-500" />
        Diskusi
        {total > 0 && <span className="text-sm font-normal text-slate-400">({total} topik)</span>}
      </h2>

      {/* New post */}
      <div className="mb-6">
        <textarea
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          placeholder="Tulis pertanyaan atau diskusi..."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={3}
          maxLength={5000}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handlePost}
            disabled={!newPost.trim() || posting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            {posting ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </div>

      {/* Threads */}
      {loading ? (
        <div className="text-center text-slate-400 py-8">Memuat diskusi...</div>
      ) : threads.length === 0 ? (
        <div className="text-center text-slate-400 py-8">Belum ada diskusi untuk modul ini.</div>
      ) : (
        <div className="space-y-3">
          {threads.map(thread => (
            <div key={thread.id} className="border border-slate-100 rounded-xl overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleThread(thread.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-700">
                        {thread.student_id}
                      </span>
                      {thread.is_lecturer ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-medium">
                          <Shield className="w-3 h-3" /> Dosen
                        </span>
                      ) : null}
                      <span className="text-xs text-slate-400">{formatRelativeTime(thread.created_at)}</span>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-3">{thread.content}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {thread.reply_count > 0 && (
                      <span className="text-xs text-slate-400">{thread.reply_count} balasan</span>
                    )}
                    {expandedThread === thread.id
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
              </div>

              {/* Expanded: replies + actions */}
              {expandedThread === thread.id && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  {/* Replies */}
                  {(replies[thread.id] ?? []).map(reply => (
                    <div key={reply.id} className="ml-4 pl-4 border-l-2 border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-700">{reply.student_id}</span>
                        {reply.is_lecturer ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-medium">
                            <Shield className="w-3 h-3" /> Dosen
                          </span>
                        ) : null}
                        <span className="text-xs text-slate-400">{formatRelativeTime(reply.created_at)}</span>
                        {(reply.student_id === user?.id || isLecturer) && (
                          <button
                            onClick={() => handleDelete(reply.id)}
                            className="text-red-400 hover:text-red-600 ml-auto"
                            aria-label="Hapus balasan"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  ))}

                  {/* Reply input */}
                  <div className="flex gap-2 ml-4">
                    <input
                      type="text"
                      value={replyContent[thread.id] ?? ''}
                      onChange={e => setReplyContent(prev => ({ ...prev, [thread.id]: e.target.value }))}
                      placeholder="Tulis balasan..."
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      maxLength={5000}
                      onKeyDown={e => { if (e.key === 'Enter') handleReply(thread.id); }}
                    />
                    <button
                      onClick={() => handleReply(thread.id)}
                      disabled={!replyContent[thread.id]?.trim()}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Delete thread (own or lecturer) */}
                  {(thread.student_id === user?.id || isLecturer) && (
                    <button
                      onClick={() => handleDelete(thread.id)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 ml-4"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus diskusi
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
