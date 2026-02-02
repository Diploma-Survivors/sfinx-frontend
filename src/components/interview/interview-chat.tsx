'use client';

import { useTranslation } from 'react-i18next';
import { Send, Bot, User } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';

export interface Message {
  id: string;
  sender: 'interviewer' | 'candidate';
  text: string;
  timestamp: Date;
}

interface InterviewChatProps {
  messages: Message[];
  inputText: string;
  onInputChange: (text: string) => void;
  onSendMessage: () => void;
}

export function InterviewChat({
  messages,
  inputText,
  onInputChange,
  onSendMessage,
}: InterviewChatProps) {
  const { t } = useTranslation('interview');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-full border shadow-sm overflow-hidden">
      <div className="h-10 px-4 flex items-center border-b bg-muted/30 flex-shrink-0">
        <Bot className="w-4 h-4 text-primary mr-2" />
        <span className="text-sm font-medium">{t('chat.title')}</span>
      </div>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.sender === 'candidate' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'candidate' ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              {msg.sender === 'candidate' ? (
                <User className="w-3.5 h-3.5 text-primary-foreground" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-secondary-foreground" />
              )}
            </div>
            <div
              className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'candidate'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm border'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            className="flex-1 h-9 px-3 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={onSendMessage}
            disabled={!inputText.trim()}
            className="w-9 h-9 flex items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
