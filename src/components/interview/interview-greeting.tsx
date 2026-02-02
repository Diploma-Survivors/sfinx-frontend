'use client';

import { useTranslation } from 'react-i18next';
import { Volume2, Mic, Code2, MessageSquare, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InterviewGreetingProps {
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
  onStartInterview: () => void;
}

export function InterviewGreeting({
  voiceEnabled,
  onVoiceEnabledChange,
  onStartInterview,
}: InterviewGreetingProps) {
  const { t } = useTranslation('interview');

  const steps = [
    { icon: Code2, key: 'solve' },
    { icon: MessageSquare, key: 'explain' },
    { icon: Mic, key: 'feedback' },
    { icon: Trophy, key: 'scores' },
  ];

  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>

        <Card className="p-5 space-y-5">
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground/80">
                  {t(`steps.${step.key}`)}
                </span>
              </div>
            ))}
          </div>

          <div className="h-px bg-border" />

          <button
            onClick={() => onVoiceEnabledChange(!voiceEnabled)}
            className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${voiceEnabled ? 'bg-primary/10' : 'bg-muted'}`}
              >
                <Volume2
                  className={`w-4 h-4 ${voiceEnabled ? 'text-primary' : 'text-muted-foreground'}`}
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{t('voice.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('voice.description')}
                </p>
              </div>
            </div>
            <div
              className={`w-10 h-6 rounded-full transition-colors ${voiceEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white mt-1 transition-transform ${voiceEnabled ? 'translate-x-5' : 'translate-x-1'}`}
              />
            </div>
          </button>

          <Button onClick={onStartInterview} className="w-full">
            {t('start')}
          </Button>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {t('duration')} • {t('noPressure')}
        </p>
      </div>
    </div>
  );
}
