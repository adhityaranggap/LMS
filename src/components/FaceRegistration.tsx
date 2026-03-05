import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCcw, Check, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface FaceRegistrationProps {
  studentId: string;
  onComplete: () => void;
  onError: (message: string) => void;
}

const POSES = [
  { key: 'front', label: 'Depan', instruction: 'Hadapkan wajah lurus ke kamera' },
  { key: 'right', label: 'Kanan', instruction: 'Miringkan wajah sedikit ke kanan' },
  { key: 'left', label: 'Kiri', instruction: 'Miringkan wajah sedikit ke kiri' },
] as const;

export const FaceRegistration: React.FC<FaceRegistrationProps> = ({
  studentId,
  onComplete,
  onError,
}) => {
  const [currentPose, setCurrentPose] = useState(0);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [poseError, setPoseError] = useState('');
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPoseError('');
      setPhotos((prev) => ({ ...prev, [POSES[currentPose].key]: imageSrc }));
    }
  }, [currentPose]);

  const retake = () => {
    setPoseError('');
    setPhotos((prev) => {
      const next = { ...prev };
      delete next[POSES[currentPose].key];
      return next;
    });
  };

  const nextPose = () => {
    if (currentPose < POSES.length - 1) {
      setCurrentPose((prev) => prev + 1);
    }
  };

  const prevPose = () => {
    if (currentPose > 0) {
      setCurrentPose((prev) => prev - 1);
    }
  };

  const allCaptured = POSES.every((p) => photos[p.key]);

  const handleSubmit = async () => {
    if (!allCaptured) return;
    setSubmitting(true);
    setPoseError('');

    try {
      // Read CSRF token from cookie
      const csrfMatch = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
      const csrfToken = csrfMatch ? decodeURIComponent(csrfMatch[1]) : '';

      const res = await fetch('/api/face/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ studentId, photos }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.pose) {
          const poseIdx = POSES.findIndex((p) => p.key === data.pose);
          if (poseIdx >= 0) setCurrentPose(poseIdx);
          setPoseError(data.error || 'Gagal memproses foto.');
          // Remove the problematic photo so user can retake
          setPhotos((prev) => {
            const next = { ...prev };
            delete next[data.pose];
            return next;
          });
        } else {
          onError(data.error || 'Registrasi wajah gagal.');
        }
        return;
      }

      onComplete();
    } catch {
      onError('Gagal terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  const pose = POSES[currentPose];
  const currentPhoto = photos[pose.key];

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {POSES.map((p, i) => (
          <div key={p.key} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPose(i)}
              className={clsx(
                'w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all',
                i === currentPose
                  ? 'bg-indigo-600 text-white'
                  : photos[p.key]
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-slate-100 text-slate-400',
              )}
            >
              {photos[p.key] ? <Check className="w-4 h-4" /> : i + 1}
            </button>
            {i < POSES.length - 1 && (
              <div
                className={clsx(
                  'w-8 h-0.5',
                  photos[p.key] ? 'bg-green-300' : 'bg-slate-200',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Pose label */}
      <div className="text-center">
        <h3 className="font-bold text-slate-900">
          Foto {currentPose + 1}/3: {pose.label}
        </h3>
        <p className="text-sm text-slate-500 mt-1">{pose.instruction}</p>
      </div>

      {/* Error */}
      {poseError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{poseError}</span>
        </div>
      )}

      {/* Camera / Preview */}
      <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-video border-2 border-dashed border-slate-300">
        {currentPhoto ? (
          <div className="relative w-full h-full">
            <img
              src={currentPhoto}
              alt={`Pose ${pose.label}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={retake}
              className="absolute top-2 right-2 bg-white/90 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white transition-colors flex items-center gap-1 shadow"
            >
              <RotateCcw className="w-3 h-3" />
              Ulang
            </button>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={capture}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-indigo-600 px-4 py-2 rounded-full font-medium shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Ambil Foto
            </button>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex justify-center gap-3">
        {POSES.map((p, i) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setCurrentPose(i)}
            className={clsx(
              'w-16 h-12 rounded-lg overflow-hidden border-2 transition-all',
              i === currentPose ? 'border-indigo-500' : 'border-slate-200',
              !photos[p.key] && 'bg-slate-100',
            )}
          >
            {photos[p.key] ? (
              <img
                src={photos[p.key]}
                alt={p.label}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                {p.label}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentPose > 0 && !allCaptured && (
          <button
            type="button"
            onClick={prevPose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            Sebelumnya
          </button>
        )}
        {currentPhoto && currentPose < POSES.length - 1 && (
          <button
            type="button"
            onClick={nextPose}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
          >
            Lanjut <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {allCaptured && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Daftarkan Wajah
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
