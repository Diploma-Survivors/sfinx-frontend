'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Clock, Mic, MicOff } from 'lucide-react';

interface InterviewHeaderProps {
  interviewTime: number;
  voiceEnabled: boolean;
  onVoiceToggle: () => void;
}

export function InterviewHeader({
  interviewTime,
  voiceEnabled,
  onVoiceToggle,
}: InterviewHeaderProps) {
  const { t } = useTranslation('interview');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-12 border-b bg-card flex-shrink-0">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-base font-semibold text-primary">
            <Clock className="w-4 h-4" />
            <span>{formatTime(interviewTime)}</span>
          </div>
          <div className="h-5 w-px bg-border" />
          <div>
            <h1 className="text-sm font-medium">{t('header.problem')}</h1>
            <p className="text-xs text-muted-foreground">
              {t('header.difficulty')} • {t('header.category')}
            </p>
          </div>
        </div>

        <Button
          onClick={onVoiceToggle}
          variant={voiceEnabled ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs gap-1.5"
        >
          {voiceEnabled ? (
            <Mic className="w-3.5 h-3.5" />
          ) : (
            <MicOff className="w-3.5 h-3.5" />
          )}
          {voiceEnabled ? t('voice.on') : t('voice.off')}
        </Button>
      </div>
    </header>
  );
}
