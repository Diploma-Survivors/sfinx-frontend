"use client";

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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  type PermissionState,
  checkMicrophonePermission,
} from "@/lib/permissions";
import type { ProblemSnapshot } from "@/types/interview";
import {
  AlertCircle,
  Clock,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface InterviewHeaderProps {
  interviewTime: number;
  voiceEnabled: boolean;
  voiceConnected: boolean;
  hasVoiceStarted?: boolean;
  isVoiceDisconnected?: boolean;
  onVoiceToggle: () => void;
  onEndInterview: () => void;
  isEnding?: boolean;
  problem?: ProblemSnapshot | null;
  readOnly?: boolean;
  scheduledEndAt?: string;
}

export function InterviewHeader({
  interviewTime,
  voiceEnabled,
  voiceConnected,
  hasVoiceStarted = false,
  isVoiceDisconnected = false,
  onVoiceToggle,
  onEndInterview,
  isEnding = false,
  problem,
  readOnly = false,
  scheduledEndAt,
}: InterviewHeaderProps) {
  const { t } = useTranslation("interview");
  const [micPermission, setMicPermission] =
    useState<PermissionState>("unknown");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);

  // Check microphone permission on mount and when voiceEnabled changes
  useEffect(() => {
    checkMicrophonePermission().then(setMicPermission);
  }, [voiceEnabled]);

  // Countdown timer effect
  useEffect(() => {
    if (!scheduledEndAt) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const end = new Date(scheduledEndAt).getTime();
      return Math.max(0, end - now);
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      setIsWarning(remaining <= 5 * 60 * 1000 && remaining > 0);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduledEndAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const showMicWarning = voiceEnabled && micPermission === "denied";

  return (
    <header className="border-b bg-card flex-shrink-0">
      <div className="h-12 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {scheduledEndAt ? (
            <div className={`flex items-center gap-1.5 font-mono text-base font-semibold ${
              isWarning ? 'text-red-600 animate-pulse' : 'text-primary'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatCountdown(timeLeft)}</span>
              {isWarning && (
                <span className="text-xs ml-1 hidden sm:inline">
                  {t('timer.timeRunningOut')}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-base font-semibold text-primary">
              <Clock className="w-4 h-4" />
              <span>{formatTime(interviewTime)}</span>
            </div>
          )}
          <div className="h-5 w-px bg-border" />
          <div className="min-w-0">
            <h1 className="text-sm font-medium truncate">
              {problem?.title || t("header.problem")}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {problem?.difficulty || t("header.difficulty")} •{" "}
              {t("header.category")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status - prop-driven, no LiveKit hook dependency */}
          {hasVoiceStarted && !readOnly && (
            <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
              voiceConnected
                ? "bg-green-500/10 text-green-500"
                : isVoiceDisconnected
                  ? "bg-muted text-muted-foreground"
                  : "bg-yellow-500/10 text-yellow-500"
            }`}>
              {voiceConnected ? (
                <Wifi className="h-3.5 w-3.5" />
              ) : isVoiceDisconnected ? (
                <WifiOff className="h-3.5 w-3.5" />
              ) : (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>
                {voiceConnected
                  ? t("livekit.voice_connected")
                  : isVoiceDisconnected
                    ? t("livekit.voice_off")
                    : t("livekit.connecting")}
              </span>
            </div>
          )}

          {/* Mic Permission Warning */}
          {showMicWarning && !readOnly && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-destructive/10 text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{t("header_ext.mic_blocked")}</span>
            </div>
          )}

          {/* Voice Toggle - Hidden in read-only mode */}
          {!readOnly && (
            <Button
              onClick={onVoiceToggle}
              variant={voiceEnabled ? "default" : "outline"}
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
                {voiceEnabled ? t("voice.on") : t("voice.off")}
              </span>
            </Button>
          )}

          {/* End Interview - Hidden in read-only mode */}
          {!readOnly && (
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
                  <span className="hidden sm:inline">{t("header.end")}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    {t("endDialog.title")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("endDialog.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("endDialog.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onEndInterview}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("endDialog.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Mic Permission Warning Banner */}
      {showMicWarning && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-md bg-destructive/10 text-destructive">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{t("header_ext.mic_blocked_desc")}</span>
          </div>
        </div>
      )}
    </header>
  );
}
