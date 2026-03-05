import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { AlertTriangle, Eye, CheckCircle, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface FraudFlag {
  id: number;
  user_id: string;
  flag_type: string;
  severity: string;
  resource_type: string | null;
  resource_id: string | null;
  details: string | null;
  is_reviewed: number;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface EnhancedStats {
  unreviewedFraudFlags: number;
  highSeverityFlags: number;
  pendingAIValidations: number;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const FLAG_TYPE_LABELS: Record<string, string> = {
  rapid_submission: 'Pengerjaan Cepat',
  tab_switch: 'Pindah Tab',
  copy_paste: 'Copy/Paste',
  identical_answers: 'Jawaban Identik',
  ai_detected: 'Terdeteksi AI',
  ip_mismatch: 'IP Tidak Konsisten',
  keystroke_anomaly: 'Anomali Keystroke',
};

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const FraudDashboard: React.FC = () => {
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<EnhancedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [filterReviewed, setFilterReviewed] = useState<string>('');
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const PAGE_SIZE = 50;

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(page * PAGE_SIZE));
      if (filterType) params.set('flag_type', filterType);
      if (filterReviewed !== '') params.set('is_reviewed', filterReviewed);

      const [flagsData, statsData] = await Promise.all([
        api<{ flags: FraudFlag[]; total: number }>(`/api/lecturer/fraud-flags?${params}`),
        api<EnhancedStats>('/api/lecturer/enhanced-stats'),
      ]);

      setFlags(flagsData.flags);
      setTotal(flagsData.total);
      setStats(statsData);
    } catch {
      setFlags([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterReviewed]);

  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  const handleReview = async (flagId: number) => {
    setReviewingId(flagId);
    try {
      await api(`/api/lecturer/fraud-flags/${flagId}/review`, { method: 'POST' });
      fetchFlags();
    } catch {} finally {
      setReviewingId(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.unreviewedFraudFlags}</div>
                <div className="text-xs text-slate-500">Belum Ditinjau</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.highSeverityFlags}</div>
                <div className="text-xs text-slate-500">Severitas Tinggi</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.pendingAIValidations}</div>
                <div className="text-xs text-slate-500">Deteksi AI Tinggi</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
        >
          <option value="">Semua Tipe</option>
          {Object.entries(FLAG_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterReviewed}
          onChange={e => { setFilterReviewed(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
        >
          <option value="">Semua Status</option>
          <option value="0">Belum Ditinjau</option>
          <option value="1">Sudah Ditinjau</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Memuat...</div>
        ) : flags.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Tidak ada flag kecurangan ditemukan</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-medium text-slate-600">Waktu</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Mahasiswa</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Tipe</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Severitas</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Resource</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {flags.map(flag => (
                <tr key={flag.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(flag.created_at)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{flag.user_id}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium">{FLAG_TYPE_LABELS[flag.flag_type] || flag.flag_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', SEVERITY_STYLES[flag.severity] || 'bg-slate-100 text-slate-600')}>
                      {flag.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{flag.resource_type ? `${flag.resource_type}/${flag.resource_id}` : '-'}</td>
                  <td className="px-4 py-3">
                    {flag.is_reviewed ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" /> Ditinjau
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!flag.is_reviewed && (
                      <button
                        onClick={() => handleReview(flag.id)}
                        disabled={reviewingId === flag.id}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                      >
                        {reviewingId === flag.id ? 'Meninjau...' : 'Tinjau'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">{total} total flag</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-600">Halaman {page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
