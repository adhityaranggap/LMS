import React, { useState, useEffect, useCallback } from 'react';
import { Server, Trash2, AlertTriangle, RefreshCw, Activity } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

interface LabEnvironment {
  id: number;
  student_id: string;
  student_name: string | null;
  template_name: string | null;
  module_id: number;
  status: string;
  attacker_ip: string;
  target_ip: string;
  started_at: string;
  expires_at: string;
}

interface LabStats {
  active: number;
  total_sessions: number;
  avg_duration_minutes: number;
  docker: { containers: number; networks: number };
}

export const LabAdmin: React.FC = () => {
  const { toast } = useToast();
  const [environments, setEnvironments] = useState<LabEnvironment[]>([]);
  const [stats, setStats] = useState<LabStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [envRes, statsRes] = await Promise.all([
        api<LabEnvironment[]>('/api/labs/admin/environments'),
        api<LabStats>('/api/labs/admin/stats'),
      ]);
      setEnvironments(envRes);
      setStats(statsRes);
    } catch {
      toast.error('Failed to load lab data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDestroy = async (envId: number) => {
    try {
      await api(`/api/labs/admin/destroy/${envId}`, { method: 'POST' });
      toast.success('Environment destroyed');
      loadData();
    } catch {
      toast.error('Failed to destroy environment');
    }
  };

  const handleDestroyAll = async () => {
    if (!confirm('Destroy ALL active lab environments? This cannot be undone.')) return;
    try {
      const data = await api<{ destroyed: number }>('/api/labs/admin/destroy-all', { method: 'POST' });
      toast.success(`Destroyed ${data.destroyed} environments`);
      loadData();
    } catch {
      toast.error('Failed to destroy environments');
    }
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded mb-6" />
        <div className="h-32 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Server className="w-7 h-7 text-indigo-500" />
          Lab Environment Manager
        </h1>
        <div className="flex gap-2">
          <button onClick={loadData} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {environments.length > 0 && (
            <button
              onClick={handleDestroyAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              Destroy All
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-indigo-600">{stats.active}</div>
            <div className="text-sm text-slate-500">Active Environments</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-slate-700">{stats.total_sessions}</div>
            <div className="text-sm text-slate-500">Total Sessions</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-slate-700">{stats.avg_duration_minutes}m</div>
            <div className="text-sm text-slate-500">Avg Duration</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-slate-700">
              {stats.docker.containers}/{stats.docker.networks}
            </div>
            <div className="text-sm text-slate-500">Containers/Networks</div>
          </div>
        </div>
      )}

      {/* Active Environments Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <h2 className="font-semibold text-slate-900">Active Environments</h2>
        </div>

        {environments.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            No active lab environments
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Module</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">IPs</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Started</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Expires</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {environments.map((env) => (
                  <tr key={env.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{env.student_name || env.student_id}</div>
                      <div className="text-xs text-slate-400">{env.student_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700">{env.template_name || `Module ${env.module_id}`}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        env.status === 'running' ? 'bg-emerald-100 text-emerald-700' :
                        env.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {env.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {env.attacker_ip} / {env.target_ip}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(env.started_at).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(env.expires_at).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDestroy(env.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Destroy environment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
