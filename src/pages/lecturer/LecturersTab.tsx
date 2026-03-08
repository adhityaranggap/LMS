import React, { useState } from 'react';
import { Plus, Trash2, KeyRound, Eye, EyeOff } from 'lucide-react';
import type { LecturerAccount } from '../../types/lecturer';
import { formatDate } from './helpers';

interface LecturersTabProps {
  lecturerAccounts: LecturerAccount[];
  currentUserId: string | undefined;
  onCreateLecturer: (form: { username: string; display_name: string; password: string }) => Promise<void>;
  onDeleteLecturer: (id: number) => void;
  onResetPassword: (id: number, newPassword: string) => Promise<void>;
}

export const LecturersTab: React.FC<LecturersTabProps> = ({
  lecturerAccounts, currentUserId, onCreateLecturer, onDeleteLecturer, onResetPassword,
}) => {
  const [form, setForm] = useState({ username: '', display_name: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetState, setResetState] = useState<{ id: number; value: string } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      await onCreateLecturer(form);
      setForm({ username: '', display_name: '', password: '' });
    } catch (err: any) {
      setFormError(err.message || 'Gagal membuat akun');
    } finally {
      setFormLoading(false);
    }
  };

  const handleReset = async (id: number) => {
    if (!resetState || resetState.id !== id) return;
    try {
      await onResetPassword(id, resetState.value);
      setResetState(null);
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Dosen Baru
        </h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            required
          />
          <input
            type="text"
            placeholder="Nama lengkap"
            value={form.display_name}
            onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 14 karakter)"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required
            />
            <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formError && <p className="sm:col-span-3 text-xs text-red-600">{formError}</p>}
          <button
            type="submit"
            disabled={formLoading}
            className="sm:col-span-3 bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {formLoading ? 'Menyimpan...' : 'Buat Akun Dosen'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Daftar Dosen ({lecturerAccounts.length})</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {lecturerAccounts.map(lec => (
            <div key={lec.id} className="px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                {lec.display_name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{lec.display_name}</p>
                <p className="text-xs text-slate-500">@{lec.username} · Bergabung {formatDate(lec.created_at)}</p>
                {!lec.password_changed_at && (
                  <span className="inline-block mt-0.5 text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">Belum ganti password</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {resetState?.id === lec.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="password"
                      placeholder="Password baru"
                      value={resetState.value}
                      onChange={e => setResetState(s => s ? { ...s, value: e.target.value } : null)}
                      className="border border-slate-200 rounded px-2 py-1 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    />
                    <button onClick={() => handleReset(lec.id)} className="text-xs bg-indigo-600 text-white rounded px-2 py-1 hover:bg-indigo-700">Simpan</button>
                    <button onClick={() => setResetState(null)} className="text-xs text-slate-500 hover:text-slate-700 px-1">Batal</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setResetState({ id: lec.id, value: '' })}
                    title="Reset password"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                )}
                {String(lec.id) !== currentUserId && (
                  <button
                    onClick={() => onDeleteLecturer(lec.id)}
                    title="Hapus akun"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {lecturerAccounts.length === 0 && (
            <p className="px-6 py-8 text-sm text-slate-400 text-center">Belum ada dosen terdaftar.</p>
          )}
        </div>
      </div>
    </div>
  );
};
