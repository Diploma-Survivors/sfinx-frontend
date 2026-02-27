"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { InterviewMessage } from "@/types/interview";
import { Bot, Loader2, Send, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface InterviewChatProps {
  messages: InterviewMessage[];
  inputText: string;
  onInputChange: (text: string) => void;
  onSendMessage: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

export function InterviewChat({
  messages,
  inputText,
  onInputChange,
  onSendMessage,
  isLoading = false,
  disabled = false,
  readOnly = false,
}: InterviewChatProps) {
  const { t } = useTranslation("interview");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="flex flex-col h-full border shadow-sm overflow-hidden">
      <div className="h-10 px-4 flex items-center border-b bg-muted/30 flex-shrink-0">
        <Bot className="w-4 h-4 text-primary mr-2" />
        <span className="text-sm font-medium">{t("chat.title")}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {t("chat.message_count", { count: messages.length })}
        </span>
      </div>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bot className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">{t("chat.empty")}</p>
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
              {showAvatar ? (
                <div
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0",
                    isUser ? "bg-primary" : "bg-secondary",
                  )}
                >
                  {isUser ? (
                    <User className="w-3.5 h-3.5 text-primary-foreground" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-secondary-foreground" />
                  )}
                </div>
              ) : (
                <div className="w-7 flex-shrink-0" />
              )}

              <div
                className={cn(
                  "flex flex-col max-w-[75%]",
                  isUser ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "px-3 py-2 rounded-2xl text-sm leading-relaxed",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm border",
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div key="loading-indicator" className="flex gap-2">
            <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-secondary-foreground" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2 border">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="p-3 border-t flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? t("chat.ended") : t("chat.placeholder")}
              disabled={disabled || isLoading}
              className="flex-1 h-9 px-3 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={onSendMessage}
              disabled={!inputText.trim() || disabled || isLoading}
              className="w-9 h-9 flex items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
