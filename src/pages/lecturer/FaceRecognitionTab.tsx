import React from 'react';
import { Check, RotateCcw, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import type { FaceStatusRow, FaceMismatchLog } from '../../types/lecturer';
import { formatDate, formatDateTime } from './helpers';

interface FaceRecognitionTabProps {
  faceStatuses: FaceStatusRow[];
  faceMismatches: FaceMismatchLog[];
  loadingFace: boolean;
  onFaceReset: (studentId: string) => void;
}

export const FaceRecognitionTab: React.FC<FaceRecognitionTabProps> = React.memo(({
  faceStatuses, faceMismatches, loadingFace, onFaceReset,
}) => (
  <>
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Face Recognition</h1>
      <p className="text-sm text-slate-500 mt-1">Kelola registrasi wajah mahasiswa dan lihat log verifikasi gagal.</p>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="font-bold text-slate-900">Status Registrasi Wajah</h2>
      </div>
      {loadingFace ? (
        <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
      ) : faceStatuses.length === 0 ? (
        <div className="p-6 text-center text-slate-400 text-sm">Belum ada data mahasiswa.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">NIM</th>
                <th className="px-6 py-3 text-left">Terdaftar</th>
                <th className="px-6 py-3 text-left hidden sm:table-cell">Tanggal Registrasi</th>
                <th className="px-6 py-3 text-left hidden sm:table-cell">Deskriptor</th>
                <th className="px-6 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {faceStatuses.map((s) => (
                <tr key={s.student_id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{s.student_id}</td>
                  <td className="px-6 py-3">
                    {s.is_face_registered ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <Check className="w-3 h-3" /> Ya
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">Belum</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-slate-500 hidden sm:table-cell">{s.face_registered_at ? formatDate(s.face_registered_at) : '-'}</td>
                  <td className="px-6 py-3 text-slate-500 hidden sm:table-cell">{s.descriptor_count}</td>
                  <td className="px-6 py-3">
                    {s.is_face_registered ? (
                      <button onClick={() => onFaceReset(s.student_id)} className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Reset
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Log Verifikasi Gagal
        </h2>
      </div>
      {loadingFace ? (
        <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
      ) : faceMismatches.length === 0 ? (
        <div className="p-6 text-center text-slate-400 text-sm">Belum ada verifikasi gagal.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">NIM</th>
                <th className="px-6 py-3 text-left">Jarak</th>
                <th className="px-6 py-3 text-left hidden sm:table-cell">Percobaan</th>
                <th className="px-6 py-3 text-left">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {faceMismatches.map((log, i) => (
                <tr key={`${log.student_id}-${i}`} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{log.student_id}</td>
                  <td className="px-6 py-3">
                    <span className={clsx(
                      'font-mono text-xs px-2 py-0.5 rounded',
                      log.distance > 0.7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
                    )}>
                      {log.distance.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500 hidden sm:table-cell">{log.attempt_number}/3</td>
                  <td className="px-6 py-3 text-slate-500">{formatDateTime(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </>
));
