import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface LabTimerProps {
  expiresAt: string;
  onExpired?: () => void;
}

export const LabTimer: React.FC<LabTimerProps> = ({ expiresAt, onExpired }) => {
  const [remaining, setRemaining] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const expires = new Date(expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setRemaining('Expired');
        onExpired?.();
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setIsUrgent(diff < 10 * 60 * 1000); // < 10 minutes

      if (hours > 0) {
        setRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setRemaining(`${minutes}m ${seconds}s`);
      } else {
        setRemaining(`${seconds}s`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono ${
      isUrgent
        ? 'bg-red-900/50 text-red-300 border border-red-700 animate-pulse'
        : 'bg-slate-800 text-slate-200 border border-slate-700'
    }`}>
      <Clock className="w-3.5 h-3.5" />
      <span>{remaining}</span>
    </div>
  );
};
