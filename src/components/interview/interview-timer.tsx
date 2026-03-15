'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface InterviewTimerProps {
  scheduledEndAt: string;
  onTimeExpired: () => void;
}

export function InterviewTimer({ scheduledEndAt, onTimeExpired }: InterviewTimerProps) {
  const { t } = useTranslation('interview');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const end = new Date(scheduledEndAt).getTime();
      return Math.max(0, end - now);
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // Show warning when 5 minutes or less remaining
      setIsWarning(remaining <= 5 * 60 * 1000 && remaining > 0);

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduledEndAt, onTimeExpired]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-12 transition-colors duration-300 ${
        isWarning ? 'bg-red-600 animate-pulse' : 'bg-primary'
      }`}
    >
      <div className="flex items-center gap-2 text-white font-mono text-lg font-semibold">
        <Clock className="w-5 h-5" />
        <span>{formatTime(timeLeft)}</span>
        {isWarning && (
          <span className="text-sm ml-2 font-medium">
            {t('timer.timeRunningOut')}
          </span>
        )}
      </div>
    </div>
  );
}
