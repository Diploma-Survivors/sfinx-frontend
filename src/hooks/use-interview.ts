'use client';

import {
  checkMicrophonePermission,
  getMicrophonePermissionErrorMessage,
  requestMicrophonePermission,
} from '@/lib/permissions';
import { InterviewService } from '@/services/interview-service';
import { toastService } from '@/services/toasts-service';
import type {
  EndInterviewRequest,
  Interview,
  InterviewEvaluation,
  InterviewMessage,
  LiveKitTokenResponse,
  MessageRole,
} from '@/types/interview';
import type { ApiError } from '@/types/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AxiosError } from 'axios';

export type InterviewPhase =
  | 'greeting'
  | 'connecting'
  | 'active'
  | 'ending'
  | 'completed';

interface UseInterviewOptions {
  onError?: (error: Error) => void;
}

interface SendMessageOptions {
  code?: string;
  language?: string;
}

interface UseInterviewReturn {
  // State
  phase: InterviewPhase;
  interview: Interview | null;
  messages: InterviewMessage[];
  liveKitToken: LiveKitTokenResponse | null;
  evaluation: InterviewEvaluation | null;
  isLoading: boolean;
  isTyping: boolean;
  error: Error | null;

  // Actions
  startInterview: (problemId: number, language?: string) => Promise<void>;
  loadInterview: (interviewId: string) => Promise<void>;
  connectVoice: () => Promise<void>;
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<void>;
  endInterview: (sourceCode?: string, languageId?: number) => Promise<void>;
  addLocalMessage: (
    role: MessageRole,
    content: string,
    messageId?: string
  ) => void;
  updateMessage: (messageId: string, content: string) => void;
  setTyping: (typing: boolean) => void;
  clearLiveKitToken: () => void;

  // Setters
  setPhase: (phase: InterviewPhase) => void;
}

/**
 * Hook for managing interview state and API interactions
 *
 * PRODUCTION NOTES:
 * - No polling: Messages are received in real-time via LiveKit data channel
 * - Code is sent with every message (not periodically synced)
 * - Optimistic updates for immediate UI feedback
 * - Proper cleanup on unmount
 */
export function useInterview(
  options: UseInterviewOptions = {}
): UseInterviewReturn {
  const { onError } = options;

  // State
  const [phase, setPhase] = useState<InterviewPhase>('greeting');
  const [interview, setInterview] = useState<Interview | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [liveKitToken, setLiveKitToken] = useState<LiveKitTokenResponse | null>(
    null
  );
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs for stable callbacks and cleanup
  const interviewRef = useRef(interview);
  interviewRef.current = interview;
  const liveKitTokenRef = useRef(liveKitToken);
  liveKitTokenRef.current = liveKitToken;
  const isConnectingVoiceRef = useRef(false);
  const pendingMessagesRef = useRef<Set<string>>(new Set());
  const isActiveRef = useRef(true);

  // Track component mount state for safe async operations
  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  // Error handler
  const handleError = useCallback(
    (err: Error) => {
      if (isActiveRef.current) {
        setError(err);
      }
      onError?.(err);
      // Only show toast for user-actionable errors, not background sync errors
      if (
        !err.message.includes('sync') &&
        !err.message.includes('data channel')
      ) {
        toastService.error(err.message);
      }
    },
    [onError]
  );

  /**
   * Start a new interview with the given problem
   */
  const startInterview = useCallback(
    async (problemId: number, language: string = 'en') => {
      if (isActiveRef.current) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await InterviewService.startInterview(problemId, language);
        const interviewData = response.data.data as Interview;

        if (isActiveRef.current) {
          setInterview(interviewData);
          setMessages([]);
          setPhase('active');
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to start interview');
        handleError(error);
        throw error;
      } finally {
        if (isActiveRef.current) setIsLoading(false);
      }
    },
    [handleError]
  );

  /**
   * Load an existing interview by ID (for session restoration)
   */
  const loadInterview = useCallback(
    async (interviewId: string) => {
      if (isActiveRef.current) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const interviewResponse = await InterviewService.getInterview(
          interviewId
        );
        const interviewData = interviewResponse.data.data as Interview;

        if (isActiveRef.current) {
          setInterview(interviewData);
          setMessages(interviewData.messages || []);

          if (interviewData.status === 'completed') {
            setEvaluation(interviewData.evaluation || null);
            setPhase('completed');
          } else if (interviewData.status === 'active') {
            setPhase('active');
          } else {
            setPhase('greeting');
          }
        }

        // Pre-connect LiveKit for all active interviews so Iris is always in
        // the room. Fresh sessions get a greeting; reconnects are silent
        // (generateGreeting returns '' when messages already exist).
        if (interviewData.status === 'active') {
          InterviewService.getLiveKitToken(interviewData.id)
            .then((res) => {
              if (isActiveRef.current) {
                setLiveKitToken(res.data.data as LiveKitTokenResponse);
              }
            })
            .catch(() => {
              // non-critical — falls back to text-only mode
            });
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to load interview');
        handleError(error);
        throw error;
      } finally {
        if (isActiveRef.current) {
          setIsLoading(false);
        }
      }
    },
    [handleError]
  );

  /**
   * Ensure mic permission and connect to the LiveKit room.
   * If a token already exists (Iris pre-connected via loadInterview), the
   * token fetch is skipped — only mic permission is verified.
   */
  const connectVoice = useCallback(async () => {
    if (isConnectingVoiceRef.current) return;

    if (!interviewRef.current) {
      const error = new Error('No active interview');
      handleError(error);
      throw error;
    }

    isConnectingVoiceRef.current = true;

    try {
      const currentPermission = await checkMicrophonePermission();
      if (currentPermission === 'denied') {
        const error = new Error(getMicrophonePermissionErrorMessage());
        handleError(error);
        throw error;
      }

      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) {
        const error = new Error(getMicrophonePermissionErrorMessage());
        handleError(error);
        throw error;
      }

      // Token already set (background pre-connect) — nothing else needed.
      if (liveKitTokenRef.current) return;

      if (isActiveRef.current) setIsLoading(true);

      try {
        const response = await InterviewService.getLiveKitToken(
          interviewRef.current.id
        );
        if (isActiveRef.current) {
          setLiveKitToken(response.data.data as LiveKitTokenResponse);
        }
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to connect to voice room');
        handleError(error);
        throw error;
      } finally {
        if (isActiveRef.current) setIsLoading(false);
      }
    } finally {
      isConnectingVoiceRef.current = false;
    }
  }, [handleError]);

  /**
   * Send a text message to the AI
   * Code is sent with every message so the AI has full context
   */
  const sendMessage = useCallback(
    async (content: string, options?: SendMessageOptions) => {
      if (!interviewRef.current) {
        handleError(new Error('No active interview'));
        return;
      }

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      pendingMessagesRef.current.add(tempId);

      const tempUserMessage: InterviewMessage = {
        id: tempId,
        interviewId: interviewRef.current.id,
        role: 'user' as MessageRole,
        content,
        createdAt: new Date().toISOString(),
      };

      if (isActiveRef.current) {
        setMessages((prev) => [...prev, tempUserMessage]);
        setIsTyping(true);
      }

      try {
        const response = await InterviewService.sendMessage(
          interviewRef.current.id,
          {
            content,
            type: 'text',
            code: options?.code,
            language: options?.language,
          }
        );

        const aiMessage = response.data.data as InterviewMessage;

        if (isActiveRef.current) {
          setMessages((prev) => {
            const filtered = prev.filter((m) => m.id !== tempId);
            const userMessage: InterviewMessage = {
              ...tempUserMessage,
              id: `user-${Date.now()}`,
            };
            return [...filtered, userMessage, aiMessage];
          });
        }
      } catch (err) {
        if (isActiveRef.current) {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
        }
        const error =
          err instanceof Error ? err : new Error('Failed to send message');
        handleError(error);
      } finally {
        pendingMessagesRef.current.delete(tempId);
        if (isActiveRef.current) {
          setIsTyping(false);
        }
      }
    },
    [handleError]
  );

  /**
   * End the interview and get evaluation
   */
  const endInterview = useCallback(async (sourceCode?: string, languageId?: number) => {
    if (!interviewRef.current) {
      handleError(new Error('No active interview'));
      return;
    }

    if (isActiveRef.current) {
      setIsLoading(true);
      setPhase('ending');
    }

    try {
      const requestData: EndInterviewRequest = {
        sourceCode: sourceCode || '',
        languageId: languageId || 11,
      };
      const response = await InterviewService.endInterview(
        interviewRef.current.id,
        requestData
      );
      const evalData = response.data.data as InterviewEvaluation;
      if (isActiveRef.current) {
        setEvaluation(evalData);
        setPhase('completed');
      }
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      handleError(
        new Error(
          error.response?.data?.message || 'Failed to end interview'
        )
      );
      if (isActiveRef.current) {
        setPhase('active');
      }
      throw err;
    } finally {
      if (isActiveRef.current) {
        setIsLoading(false);
      }
    }
  }, [handleError]);

  /**
   * Add a message locally (for voice transcripts from data channel)
   * Handles streaming updates by checking if message already exists
   */
  const addLocalMessage = useCallback(
    (role: MessageRole, content: string, messageId?: string) => {
      if (!interviewRef.current) return;

      const id =
        messageId ||
        `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      if (isActiveRef.current) {
        setMessages((prev) => {
          const existingIndex = prev.findIndex((m) => m.id === id);

          if (existingIndex >= 0) {
            // Streaming update: accumulate content into the existing entry.
            // If the fully-accumulated text now matches another message (e.g.
            // the greeting already seeded from the DB), remove this streaming
            // copy — the DB message is the canonical one.
            const isDuplicateOfAnother = prev.some(
              (m, i) => i !== existingIndex && m.content === content && m.role === role
            );
            if (isDuplicateOfAnother) {
              return prev.filter((_, i) => i !== existingIndex);
            }
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], content };
            return updated;
          }

          // New entry: skip exact duplicates for assistant only (prevents DB greeting
          // from duplicating when LiveKit also sends it as a transcript).
          // User STT messages must always be added — the same words can appear in
          // different turns (e.g. "okay" → think → "okay" again).
          if (role !== 'user' && prev.some((m) => m.content === content && m.role === role)) {
            return prev;
          }

          return [
            ...prev,
            {
              id,
              interviewId: interviewRef.current!.id,
              role,
              content,
              createdAt: new Date().toISOString(),
            },
          ];
        });
      }
    },
    []
  );

  /**
   * Update an existing message's content (for streaming)
   */
  const updateMessage = useCallback(
    (
      messageId: string,
      contentOrUpdater: string | ((prevContent: string) => string)
    ) => {
      if (isActiveRef.current) {
        setMessages((prev) => {
          const existingIndex = prev.findIndex((m) => m.id === messageId);
          if (existingIndex < 0) return prev;

          const updated = [...prev];
          const currentContent = updated[existingIndex].content;
          const newContent =
            typeof contentOrUpdater === 'function'
              ? contentOrUpdater(currentContent)
              : contentOrUpdater;
          updated[existingIndex] = {
            ...updated[existingIndex],
            content: newContent,
          };
          return updated;
        });
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pendingMessagesRef.current.clear();
    };
  }, []);

  /**
   * Clear LiveKit token (forces a fresh connect on next enable).
   */
  const clearLiveKitToken = useCallback(() => {
    if (isActiveRef.current) setLiveKitToken(null);
  }, []);


  return {
    phase,
    interview,
    messages,
    liveKitToken,
    evaluation,
    isLoading,
    isTyping,
    error,
    startInterview,
    loadInterview,
    connectVoice,
    sendMessage,
    endInterview,
    addLocalMessage,
    updateMessage,
    setTyping: setIsTyping,
    setPhase,
    clearLiveKitToken,
  };
}
