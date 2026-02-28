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
import { cn } from "@/lib/utils";
import type { InterviewMessage } from "@/types/interview";
import {
  AlertCircle,
  Check,
  Copy,
  Mic,
  MicOff,
  Plus,
  Send,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

// ─── Voice Wave Indicator ────────────────────────────────────────────────────

function VoiceWaveIndicator({
  isActive,
  barCount = 7,
}: {
  isActive: boolean;
  barCount?: number;
}) {
  const [heights, setHeights] = useState<number[]>(Array(barCount).fill(4));

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(barCount).fill(4));
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        Array(barCount)
          .fill(0)
          .map((_, i) => {
            const centerFactor =
              1 - (Math.abs(i - barCount / 2) / (barCount / 2)) * 0.5;
            return Math.random() * 24 * centerFactor + 8;
          })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  return (
    <div className="flex items-end justify-center gap-[3px] h-10">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-primary/60 transition-all duration-150 ease-out"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

// ─── Voice Orb (visual state indicator) ──────────────────────────────────────

interface VoiceOrbProps {
  audioLevel?: number;
  isUserSpeaking?: boolean;
  isAgentSpeaking?: boolean;
  isMuted?: boolean;
}

export function VoiceOrb({
  audioLevel = 0,
  isUserSpeaking = false,
  isAgentSpeaking = false,
  isMuted = false,
}: VoiceOrbProps) {
  const ringScale = isUserSpeaking ? 1 + audioLevel * 0.5 : 1;
  const midRingScale = isUserSpeaking ? 1 + audioLevel * 0.4 : 1;
  const coreScale = isUserSpeaking ? 1 + audioLevel * 0.3 : 1;

  const label = isMuted
    ? "Microphone muted"
    : isAgentSpeaking
      ? "AI is responding..."
      : "Listening...";

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {/* Orb with concentric rings — always rendered, same structure */}
      <div className="relative flex items-center justify-center w-24 h-24">
        <div
          className={cn(
            "absolute rounded-full transition-transform duration-150",
            isAgentSpeaking ? "bg-primary/8 animate-pulse" : "bg-primary/5",
          )}
          style={{
            width: "96px",
            height: "96px",
            transform: `scale(${ringScale})`,
            animationDuration: isAgentSpeaking ? "2s" : undefined,
          }}
        />
        <div
          className={cn(
            "absolute rounded-full transition-transform duration-100",
            isAgentSpeaking ? "bg-primary/15 animate-pulse" : "bg-primary/10",
          )}
          style={{
            width: "64px",
            height: "64px",
            transform: `scale(${midRingScale})`,
          }}
        />
        <div
          className="relative rounded-full bg-primary/20 flex items-center justify-center transition-transform duration-75"
          style={{
            width: "40px",
            height: "40px",
            transform: `scale(${coreScale})`,
          }}
        >
          {isMuted ? (
            <MicOff className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Mic className="w-4 h-4 text-primary" />
          )}
        </div>
      </div>

      {/* Wave bars — always rendered, activity drives animation */}
      <VoiceWaveIndicator isActive={isUserSpeaking && !isMuted} />

      {/* Label — always rendered, text changes based on state */}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Main Voice Mode Chat ────────────────────────────────────────────────────

interface VoiceModeChatProps {
  messages: InterviewMessage[];
  inputText: string;
  onInputChange: (text: string) => void;
  onSendMessage: () => void;
  onEndInterview: () => void;
  isLoading?: boolean;
  isAgentSpeaking?: boolean;
  voiceConnected?: boolean;
  readOnly?: boolean;
  interviewStartedAt?: string;
  voiceIndicator?: ReactNode;
  isEnding?: boolean;
}

export function VoiceModeChat({
  messages,
  inputText,
  onInputChange,
  onSendMessage,
  onEndInterview,
  isLoading = false,
  voiceConnected = false,
  readOnly = false,
  interviewStartedAt,
  voiceIndicator,
  isEnding = false,
}: VoiceModeChatProps) {
  const { t } = useTranslation("interview");
  const chatRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const userWasAtBottomRef = useRef(true);

  const handleScroll = () => {
    const el = chatRef.current;
    if (!el) return;
    userWasAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // Only auto-scroll when user is near bottom (hasn't manually scrolled up)
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    if (userWasAtBottomRef.current || messages.length <= 1) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const getRelativeTime = (dateString: string) => {
    if (!interviewStartedAt) {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    const start = new Date(interviewStartedAt).getTime();
    const msgTime = new Date(dateString).getTime();
    const diffSec = Math.max(0, Math.floor((msgTime - start) / 1000));
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border shadow-sm overflow-hidden">
      {/* Messages Area */}
      <div
        ref={chatRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-0"
      >
        {messages.length === 0 && !voiceConnected && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <Mic className="w-8 h-8 opacity-20" />
            <p className="text-sm">Start speaking or type a message</p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col",
                isUser ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  isUser
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted/60 text-foreground rounded-bl-md border border-border/30"
                )}
              >
                <p className="whitespace-pre-wrap">
                  {isUser ? `\u201C${msg.content}\u201D` : msg.content}
                </p>
              </div>

              <div
                className={cn(
                  "flex items-center gap-1.5 mt-1 px-1",
                  isUser ? "flex-row-reverse" : "flex-row"
                )}
              >
                <span className="text-[10px] text-muted-foreground/60">
                  {getRelativeTime(msg.createdAt)}
                </span>

                {!isUser && (
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 rounded-md hover:bg-muted/80 transition-colors group"
                      title="Copy"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground" />
                      )}
                    </button>
                    <button className="p-1 rounded-md hover:bg-muted/80 transition-colors group">
                      <ThumbsUp className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground" />
                    </button>
                    <button className="p-1 rounded-md hover:bg-muted/80 transition-colors group">
                      <ThumbsDown className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Voice indicator - shown when voice is connected */}
        {voiceConnected && voiceIndicator}

        {/* Text-mode loading indicator */}
        {isLoading && !voiceConnected && (
          <div className="flex gap-1 px-4 py-2">
            <span
              className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        )}
      </div>

      {/* Bottom Input Bar */}
      {!readOnly && (
        <div className="px-3 py-2.5 border-t bg-card/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border border-border/40 hover:bg-muted/60 transition-colors flex-shrink-0"
              title="More options"
            >
              <Plus className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type"
              disabled={isLoading}
              className="flex-1 h-8 px-3 text-sm bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/40 disabled:opacity-50"
            />

            {inputText.trim() ? (
              <button
                onClick={onSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full transition-colors flex-shrink-0",
                  voiceConnected
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/60 text-muted-foreground"
                )}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={isEnding}
                  className="h-8 px-3 flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0 text-xs font-medium disabled:opacity-50"
                >
                  <span className="flex gap-0.5 items-center">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={cn(
                          "w-[3px] rounded-full bg-primary-foreground/70",
                          voiceConnected ? "animate-pulse" : ""
                        )}
                        style={{
                          height: voiceConnected
                            ? `${6 + Math.sin(i * 1.2) * 4}px`
                            : "3px",
                          animationDelay: `${i * 200}ms`,
                        }}
                      />
                    ))}
                  </span>
                  <span>End</span>
                </button>
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
          </div>
        </div>
      )}
    </div>
  );
}
