import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, Users, BarChart3, LogOut, Check, X } from 'lucide-react';
import clsx from 'clsx';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  config: string | null;
  is_active: number;
  created_at: string;
}

interface TenantStats {
  tenantId: number;
  totalStudents: number;
  totalLecturers: number;
  totalQuizAttempts: number;
  avgQuizScore: number | null;
}

export const SuperAdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [tenantStats, setTenantStats] = useState<TenantStats | null>(null);

  const fetchTenants = async () => {
    try {
      const data = await api<{ tenants: Tenant[] }>('/api/tenants');
      setTenants(data.tenants);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  useEffect(() => {
    if (selectedTenant) {
      api<TenantStats>(`/api/tenants/${selectedTenant}/stats`)
        .then(setTenantStats)
        .catch(() => setTenantStats(null));
    } else {
      setTenantStats(null);
    }
  }, [selectedTenant]);

  const handleCreate = async () => {
    if (!newName || !newSlug) return;
    setCreating(true);
    try {
      await api('/api/tenants', {
        method: 'POST',
        body: JSON.stringify({ name: newName, slug: newSlug }),
      });
      setNewName('');
      setNewSlug('');
      setShowCreate(false);
      fetchTenants();
    } catch {} finally {
      setCreating(false);
    }
  };

  const toggleActive = async (tenant: Tenant) => {
    try {
      await api(`/api/tenants/${tenant.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !tenant.is_active }),
      });
      fetchTenants();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Super Admin Dashboard</h1>
              <p className="text-xs text-slate-500">Multi-Tenancy Management</p>
            </div>
          </div>
          <button onClick={() => logout()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Tenants ({tenants.length})</h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Tambah Tenant
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Tenant Baru</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nama Institusi"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Slug (lowercase, hyphens)"
                value={newSlug}
                onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreate}
                disabled={creating || !newName || !newSlug}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? 'Membuat...' : 'Buat Tenant'}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-slate-500 text-sm hover:text-slate-700">
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Tenant List */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">Memuat...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tenants.map(tenant => (
              <div
                key={tenant.id}
                className={clsx(
                  'bg-white rounded-xl border p-5 transition-all cursor-pointer',
                  selectedTenant === tenant.id ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'
                )}
                onClick={() => setSelectedTenant(selectedTenant === tenant.id ? null : tenant.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx('w-3 h-3 rounded-full', tenant.is_active ? 'bg-green-400' : 'bg-slate-300')} />
                    <div>
                      <h3 className="font-semibold text-slate-900">{tenant.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{tenant.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleActive(tenant); }}
                      className={clsx(
                        'p-1.5 rounded-lg text-xs font-medium',
                        tenant.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                      )}
                    >
                      {tenant.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Stats panel */}
                {selectedTenant === tenant.id && tenantStats && (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-lg font-bold text-slate-900">{tenantStats.totalStudents}</div>
                        <div className="text-xs text-slate-500">Mahasiswa</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">{tenantStats.totalLecturers}</div>
                      <div className="text-xs text-slate-500">Dosen</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">{tenantStats.totalQuizAttempts}</div>
                      <div className="text-xs text-slate-500">Quiz Attempts</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-lg font-bold text-slate-900">{tenantStats.avgQuizScore ?? '-'}</div>
                        <div className="text-xs text-slate-500">Avg Score</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
