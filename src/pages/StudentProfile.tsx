import React, { useState, useEffect } from 'react';
import { User, Save, Edit3, X } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ProfileData {
  student_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  birth_date: string | null;
  gender: string | null;
  program_studi: string | null;
  semester: number | null;
  angkatan: string | null;
  course_id: string | null;
  created_at: string;
}

export const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    gender: '',
    program_studi: '',
    semester: '',
    angkatan: '',
  });

  useEffect(() => {
    api<{ profile: ProfileData }>('/api/student/profile')
      .then(data => {
        setProfile(data.profile);
        setForm({
          full_name: data.profile.full_name ?? '',
          email: data.profile.email ?? '',
          phone: data.profile.phone ?? '',
          address: data.profile.address ?? '',
          birth_date: data.profile.birth_date ?? '',
          gender: data.profile.gender ?? '',
          program_studi: data.profile.program_studi ?? '',
          semester: data.profile.semester?.toString() ?? '',
          angkatan: data.profile.angkatan ?? '',
        });
      })
      .catch(() => toast.error('Gagal memuat profil'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/api/student/profile', {
        method: 'PUT',
        body: JSON.stringify({
          ...form,
          semester: form.semester ? Number(form.semester) : null,
        }),
      });
      toast.success('Profil berhasil disimpan');
      setEditing(false);
      // Refresh profile
      const data = await api<{ profile: ProfileData }>('/api/student/profile');
      setProfile(data.profile);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="bg-white rounded-2xl p-8 border border-slate-200">
          <div className="h-8 w-48 bg-slate-200 rounded mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const fields: { key: keyof typeof form; label: string; type?: string; placeholder?: string; options?: { value: string; label: string }[] }[] = [
    { key: 'full_name', label: 'Nama Lengkap', placeholder: 'Masukkan nama lengkap' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'contoh@email.com' },
    { key: 'phone', label: 'No. Telepon', type: 'tel', placeholder: '08xxxxxxxxxx' },
    { key: 'address', label: 'Alamat', placeholder: 'Alamat lengkap' },
    { key: 'birth_date', label: 'Tanggal Lahir', type: 'date' },
    { key: 'gender', label: 'Jenis Kelamin', options: [{ value: '', label: 'Pilih...' }, { value: 'male', label: 'Laki-laki' }, { value: 'female', label: 'Perempuan' }] },
    { key: 'program_studi', label: 'Program Studi', placeholder: 'Teknik Informatika' },
    { key: 'semester', label: 'Semester', type: 'number', placeholder: '1-14' },
    { key: 'angkatan', label: 'Angkatan', placeholder: '2024' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              {user?.photo ? (
                <img src={user.photo} alt="Foto profil" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {profile.full_name || profile.student_id}
              </h1>
              <p className="text-sm text-slate-500">NIM: {profile.student_id}</p>
            </div>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Batal
            </button>
          )}
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(field => (
              <div key={field.key} className={field.key === 'address' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {field.label}
                </label>
                {field.options ? (
                  <select
                    value={form[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-600"
                  >
                    {field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type ?? 'text'}
                    value={form[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    disabled={!editing}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-600"
                  />
                )}
              </div>
            ))}
          </div>

          {editing && (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
