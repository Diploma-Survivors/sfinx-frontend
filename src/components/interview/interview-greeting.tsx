'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Code2,
  Loader2,
  MessageSquare,
  Mic,
  Sparkles,
  Trophy,
  Volume2,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface InterviewGreetingProps {
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
  onStartInterview: () => void;
  isLoading?: boolean;
}

export function InterviewGreeting({
  voiceEnabled,
  onVoiceEnabledChange,
  onStartInterview,
  isLoading = false,
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

          {/* Random Problem Notice */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-600">
                Random Problem Selection
              </p>
              <p className="text-blue-600/70 text-xs mt-0.5">
                {/* TODO: Implement problem selection UI */}A random problem
                will be selected for you. Problem selection UI coming soon!
              </p>
            </div>
          </div>

          <button
            onClick={() => onVoiceEnabledChange(!voiceEnabled)}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50"
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

          <Button
            onClick={onStartInterview}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              t('start')
            )}
          </Button>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {t('duration')} • {t('noPressure')}
        </p>
      </div>
    </div>
  );
}

/**
 * Loading state for when we're fetching a random problem
 */
export function InterviewGreetingSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="h-9 w-48 bg-muted rounded-lg mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded mx-auto animate-pulse" />
        </div>

        <Card className="p-5 space-y-5">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>

          <div className="h-px bg-border" />
          <div className="h-16 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 bg-muted rounded-lg animate-pulse" />
        </Card>
      </div>
    </div>
  );
}
