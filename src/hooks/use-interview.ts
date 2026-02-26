'use client';

import {
  checkMicrophonePermission,
  getMicrophonePermissionErrorMessage,
  requestMicrophonePermission,
} from '@/lib/permissions';
import { InterviewService } from '@/services/interview-service';
import { toastService } from '@/services/toasts-service';
import type {
  Interview,
  InterviewEvaluation,
  InterviewMessage,
  LiveKitTokenResponse,
  MessageRole,
  StartInterviewResponse,
} from '@/types/interview';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  startInterview: (problemId: number) => Promise<void>;
  loadInterview: (interviewId: string) => Promise<void>;
  connectVoice: () => Promise<void>;
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<void>;
  endInterview: () => Promise<void>;
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
    async (problemId: number) => {
      if (isActiveRef.current) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await InterviewService.startInterview(problemId);
        const data = response.data.data as StartInterviewResponse;

        // Fetch full interview details
        const interviewResponse = await InterviewService.getInterview(
          data.interviewId
        );
        const interviewData = interviewResponse.data.data as Interview;

        if (isActiveRef.current) {
          setInterview(interviewData);
          setMessages(interviewData.messages || []);
          // Transition to active phase
          setPhase('active');
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to start interview');
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
          
          // Set phase based on interview status
          if (interviewData.status === 'completed') {
            setEvaluation(interviewData.evaluation || null);
            setPhase('completed');
          } else if (interviewData.status === 'active') {
            setPhase('active');
          } else {
            setPhase('greeting');
          }
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
   * Get LiveKit token and connect to voice room
   */
  const connectVoice = useCallback(async () => {
    // Prevent duplicate connection attempts
    if (isConnectingVoiceRef.current) {
      return;
    }

    if (!interviewRef.current) {
      const error = new Error('No active interview');
      handleError(error);
      throw error;
    }

    isConnectingVoiceRef.current = true;

    try {
      // Check current permission status first
      const currentPermission = await checkMicrophonePermission();

      if (currentPermission === 'denied') {
        const error = new Error(getMicrophonePermissionErrorMessage());
        handleError(error);
        throw error;
      }

      // Request microphone permission before connecting
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) {
        const error = new Error(getMicrophonePermissionErrorMessage());
        handleError(error);
        throw error;
      }

      if (isActiveRef.current) {
        setIsLoading(true);
        setPhase('connecting');
      }

      try {
        const response = await InterviewService.getLiveKitToken(
          interviewRef.current.id
        );
        const tokenData = response.data.data as LiveKitTokenResponse;
        if (isActiveRef.current) {
          setLiveKitToken(tokenData);
          setPhase('active');
        }
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to connect to voice room');
        handleError(error);
        if (isActiveRef.current) {
          setPhase('active'); // Fall back to text-only mode
        }
        throw error;
      } finally {
        if (isActiveRef.current) {
          setIsLoading(false);
        }
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
      console.log('[sendMessage] Starting:', {
        content: content.substring(0, 50),
        options,
      });

      if (!interviewRef.current) {
        console.error('[sendMessage] No active interview');
        handleError(new Error('No active interview'));
        return;
      }

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      pendingMessagesRef.current.add(tempId);

      // Optimistically add user message
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
        console.log('[sendMessage] Added optimistic user message');
      }

      try {
        console.log('[sendMessage] Sending to API...');
        const response = await InterviewService.sendMessage(
          interviewRef.current.id,
          {
            content,
            type: 'text',
            code: options?.code,
            language: options?.language,
          }
        );
        console.log('[sendMessage] API response:', response.data);

        const aiMessage = response.data.data as InterviewMessage;
        console.log('[sendMessage] AI message:', aiMessage);

        if (isActiveRef.current) {
          setMessages((prev) => {
            const filtered = prev.filter((m) => m.id !== tempId);

            // Convert temp to permanent
            const userMessage: InterviewMessage = {
              ...tempUserMessage,
              id: `user-${Date.now()}`,
            };

            console.log('[sendMessage] Adding user and AI messages to state');
            return [...filtered, userMessage, aiMessage];
          });
        }
      } catch (err) {
        console.error('[sendMessage] Error:', err);
        // Remove optimistic message on error
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
  const endInterview = useCallback(async () => {
    if (!interviewRef.current) {
      handleError(new Error('No active interview'));
      return;
    }

    if (isActiveRef.current) {
      setIsLoading(true);
      setPhase('ending');
    }

    try {
      const response = await InterviewService.endInterview(
        interviewRef.current.id
      );
      const evalData = response.data.data as InterviewEvaluation;
      if (isActiveRef.current) {
        setEvaluation(evalData);
        setPhase('completed');
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to end interview');
      handleError(error);
      if (isActiveRef.current) {
        setPhase('active');
      }
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
          // Check if we're updating an existing streaming message
          const existingIndex = prev.findIndex((m) => m.id === id);

          if (existingIndex >= 0) {
            // Update existing message (streaming continuation)
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], content };
            return updated;
          }

          // Check for duplicate (avoid adding same content twice within 5 seconds)
          const isDuplicate = prev.some(
            (m) =>
              m.content === content &&
              m.role === role &&
              Date.now() - new Date(m.createdAt).getTime() < 5000
          );

          if (isDuplicate) return prev;

          // Add new message
          const newMessage: InterviewMessage = {
            id,
            interviewId: interviewRef.current!.id,
            role,
            content,
            createdAt: new Date().toISOString(),
          };

          return [...prev, newMessage];
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
   * Clear LiveKit token (for disconnecting voice)
   */
  const clearLiveKitToken = useCallback(() => {
    if (isActiveRef.current) {
      setLiveKitToken(null);
    }
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
