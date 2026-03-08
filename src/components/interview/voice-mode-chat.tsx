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
import { ChatMarkdown } from "@/components/ui/chat-markdown";
import { cn } from "@/lib/utils";
import type { InterviewMessage } from "@/types/interview";
import {
  AlertCircle,
  Bot,
  Check,
  Copy,
  Loader2,
  Mic,
  MicOff,
  Plus,
  Send,
  ThumbsDown,
  ThumbsUp,
  User,
  WifiOff,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/contexts/app-context";

// ─── Voice Wave Indicator ────────────────────────────────────────────────────

function VoiceWaveIndicator({
  isActive,
  barCount = 7,
}: {
  isActive: boolean;
  barCount?: number;
}) {
  const rafRef = useRef<number | null>(null);
  const currentRef = useRef<number[]>(Array(barCount).fill(4));
  const targetRef = useRef<number[]>(Array(barCount).fill(4));
  const lastTargetUpdateRef = useRef(0);
  const [heights, setHeights] = useState<number[]>(Array(barCount).fill(4));

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (!isActive) {
      // Smoothly return bars to flat at 60fps
      const animateFlat = () => {
        const current = currentRef.current;
        const next = current.map((h) => {
          const diff = 4 - h;
          if (Math.abs(diff) < 0.3) return 4;
          return h + diff * 0.15;
        });
        currentRef.current = next;
        setHeights([...next]);
        if (next.some((h) => Math.abs(h - 4) > 0.3)) {
          rafRef.current = requestAnimationFrame(animateFlat);
        }
      };
      rafRef.current = requestAnimationFrame(animateFlat);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    const animate = (timestamp: number) => {
      // Pick new random targets every ~200ms for variety
      if (timestamp - lastTargetUpdateRef.current > 200) {
        lastTargetUpdateRef.current = timestamp;
        targetRef.current = Array(barCount)
          .fill(0)
          .map((_, i) => {
            const center = barCount / 2;
            const centerFactor = 1 - (Math.abs(i - center) / center) * 0.5;
            return Math.random() * 24 * centerFactor + 8;
          });
      }

      // Lerp current → target each frame (60fps, no CSS transitions needed)
      const next = currentRef.current.map(
        (h, i) => h + (targetRef.current[i] - h) * 0.12,
      );
      currentRef.current = next;
      setHeights([...next]);

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, barCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="flex items-end justify-center gap-[3px] h-10">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-primary/60"
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

  const { t } = useTranslation("interview");

  const label = isMuted
    ? t("voice_chat.muted")
    : isAgentSpeaking
      ? t("voice_chat.ai_responding")
      : t("voice_chat.listening");

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
          ) : isAgentSpeaking ? (
            <Bot className="w-4 h-4 text-primary" />
          ) : (
            <Mic className="w-4 h-4 text-primary" />
          )}
        </div>
      </div>

      {/* Wave bars — animate for both user speaking and agent speaking */}
      <VoiceWaveIndicator isActive={isAgentSpeaking || (isUserSpeaking && !isMuted)} />

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
  isDisconnected?: boolean;
  isReconnecting?: boolean;
  onReconnect?: () => void;
}

const PLACEHOLDER_AVATAR =
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

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
  isDisconnected = false,
  isReconnecting = false,
  onReconnect,
}: VoiceModeChatProps) {
  const { t } = useTranslation("interview");
  const { user } = useApp();
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
      {/* Header bar — AI avatar (left) + user avatar (right) */}
      <div className="h-10 px-3 flex items-center border-b bg-muted/30 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Bot className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium truncate">{t("chat.title")}</span>
        </div>

        <div className="flex-1" />

        {user && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-muted-foreground truncate hidden sm:block">
              {user.fullName || user.username}
            </span>
            <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 border border-border/40">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_AVATAR;
                  }}
                />
              ) : (
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={chatRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-0"
      >
        {messages.length === 0 && !voiceConnected && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <Mic className="w-8 h-8 opacity-20" />
            <p className="text-sm">{t("voice_chat.empty")}</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const showAvatar =
            index === 0 || messages[index - 1]?.role !== msg.role;

          return (
            <div
              key={msg.id}
              className={cn("flex gap-2", isUser ? "flex-row-reverse" : "")}
            >
              {/* Avatar — only on first message of a consecutive group */}
              {showAvatar ? (
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                    isUser
                      ? "bg-primary/15 overflow-hidden border border-border/40"
                      : "bg-secondary",
                  )}
                >
                  {isUser ? (
                    user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            PLACEHOLDER_AVATAR;
                        }}
                      />
                    ) : (
                      <User className="w-3 h-3 text-primary" />
                    )
                  ) : (
                    <Bot className="w-3 h-3 text-secondary-foreground" />
                  )}
                </div>
              ) : (
                <div className="w-6 flex-shrink-0" />
              )}

              <div
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isUser ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/60 text-foreground rounded-bl-md border border-border/30",
                  )}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {`\u201C${msg.content}\u201D`}
                    </p>
                  ) : (
                    <ChatMarkdown content={msg.content} />
                  )}
                </div>

                <div
                  className={cn(
                    "flex items-center gap-1.5 mt-1 px-1",
                    isUser ? "flex-row-reverse" : "flex-row",
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

      {/* Disconnected Banner */}
      {isDisconnected && !isReconnecting && (
        <div className="px-3 py-2 border-t bg-destructive/5 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-destructive">
            <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t("voice_chat.disconnected")}</span>
          </div>
          <button
            onClick={onReconnect}
            className="text-xs px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            {t("voice_chat.reconnect")}
          </button>
        </div>
      )}
      {isReconnecting && (
        <div className="px-3 py-2 border-t bg-yellow-500/10 flex items-center gap-2 flex-shrink-0">
          <Loader2 className="w-3.5 h-3.5 text-yellow-600 animate-spin flex-shrink-0" />
          <span className="text-xs text-yellow-600">{t("livekit.reconnecting")}</span>
        </div>
      )}

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
              placeholder={t("chat.placeholder")}
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
                    : "hover:bg-muted/60 text-muted-foreground",
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
                          voiceConnected ? "animate-pulse" : "",
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
                  <span>{t("header.end")}</span>
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
