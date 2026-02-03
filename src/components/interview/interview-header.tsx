'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  type PermissionState,
  checkMicrophonePermission,
} from '@/lib/permissions';
import type { ProblemSnapshot } from '@/types/interview';
import {
  AlertCircle,
  Clock,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectionAlert, ConnectionStatus } from './livekit';

interface InterviewHeaderProps {
  interviewTime: number;
  voiceEnabled: boolean;
  voiceConnected: boolean;
  onVoiceToggle: () => void;
  onEndInterview: () => void;
  isEnding?: boolean;
  problem?: ProblemSnapshot | null;
}

export function InterviewHeader({
  interviewTime,
  voiceEnabled,
  voiceConnected,
  onVoiceToggle,
  onEndInterview,
  isEnding = false,
  problem,
}: InterviewHeaderProps) {
  const { t } = useTranslation('interview');
  const [micPermission, setMicPermission] =
    useState<PermissionState>('unknown');

  // Check microphone permission on mount and when voiceEnabled changes
  useEffect(() => {
    checkMicrophonePermission().then(setMicPermission);
  }, [voiceEnabled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showMicWarning = voiceEnabled && micPermission === 'denied';

  return (
    <header className="border-b bg-card flex-shrink-0">
      <div className="h-12 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-base font-semibold text-primary">
            <Clock className="w-4 h-4" />
            <span>{formatTime(interviewTime)}</span>
          </div>
          <div className="h-5 w-px bg-border" />
          <div className="min-w-0">
            <h1 className="text-sm font-medium truncate">
              {problem?.title || t('header.problem')}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {problem?.difficulty || t('header.difficulty')} •{' '}
              {t('header.category')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status - Only show when voice is enabled */}
          {voiceEnabled && voiceConnected && (
            <ConnectionStatus className="hidden sm:flex" />
          )}

          {/* Mic Permission Warning */}
          {showMicWarning && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-destructive/10 text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Mic blocked</span>
            </div>
          )}

          {/* Voice Toggle */}
          <Button
            onClick={onVoiceToggle}
            variant={voiceEnabled ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs gap-1.5"
            disabled={isEnding}
          >
            {voiceEnabled ? (
              <Mic className="w-3.5 h-3.5" />
            ) : (
              <MicOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {voiceEnabled ? t('voice.on') : t('voice.off')}
            </span>
          </Button>

          {/* End Interview */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-xs gap-1.5"
                disabled={isEnding}
              >
                {isEnding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PhoneOff className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{t('header.end')}</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  {t('endDialog.title')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('endDialog.description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('endDialog.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onEndInterview}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t('endDialog.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Connection Alert Banner */}
      {voiceEnabled && voiceConnected && (
        <div className="px-4 pb-2">
          <ConnectionAlert />
        </div>
      )}

      {/* Mic Permission Warning Banner */}
      {showMicWarning && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-md bg-destructive/10 text-destructive">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              Microphone access is blocked. Please allow microphone access in
              your browser settings to use voice mode.
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
