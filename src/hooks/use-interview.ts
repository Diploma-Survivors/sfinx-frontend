'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { InterviewService } from '@/services/interview-service';
import { toastService } from '@/services/toasts-service';
import { requestMicrophonePermission, checkMicrophonePermission, getMicrophonePermissionErrorMessage } from '@/lib/permissions';
import type {
  Interview,
  InterviewMessage,
  InterviewEvaluation,
  StartInterviewResponse,
  LiveKitTokenResponse,
  MessageRole,
} from '@/types/interview';

export type InterviewPhase = 'greeting' | 'connecting' | 'active' | 'ending' | 'completed';

interface UseInterviewOptions {
  onError?: (error: Error) => void;
}

interface UseInterviewReturn {
  // State
  phase: InterviewPhase;
  interview: Interview | null;
  messages: InterviewMessage[];
  liveKitToken: LiveKitTokenResponse | null;
  evaluation: InterviewEvaluation | null;
  isLoading: boolean;
  error: Error | null;

  // Actions
  startInterview: (problemId: number) => Promise<void>;
  connectVoice: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  endInterview: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  addLocalMessage: (role: MessageRole, content: string) => void;

  // Setters
  setPhase: (phase: InterviewPhase) => void;
}

/**
 * Hook for managing interview state and API interactions
 */
export function useInterview(options: UseInterviewOptions = {}): UseInterviewReturn {
  const { onError } = options;

  // State
  const [phase, setPhase] = useState<InterviewPhase>('greeting');
  const [interview, setInterview] = useState<Interview | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [liveKitToken, setLiveKitToken] = useState<LiveKitTokenResponse | null>(null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs
  const interviewRef = useRef(interview);
  interviewRef.current = interview;
  const lastMessageCountRef = useRef(0);
  const isConnectingVoiceRef = useRef(false);

  // Update error ref for callbacks
  const handleError = useCallback(
    (err: Error) => {
      setError(err);
      onError?.(err);
      toastService.error(err.message);
    },
    [onError]
  );

  /**
   * Start a new interview with the given problem
   */
  const startInterview = useCallback(
    async (problemId: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await InterviewService.startInterview(problemId);
        const data = response.data.data as StartInterviewResponse;

        // Fetch full interview details
        const interviewResponse = await InterviewService.getInterview(data.interviewId);
        const interviewData = interviewResponse.data.data as Interview;

        setInterview(interviewData);
        setMessages(
          interviewData.messages?.map((m) => ({
            ...m,
            createdAt: m.createdAt,
          })) || []
        );
        lastMessageCountRef.current = interviewData.messages?.length || 0;
        // Transition to active phase to show the interview UI
        setPhase('active');
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to start interview');
        handleError(error);
        throw error;
      } finally {
        setIsLoading(false);
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
      console.log('Voice connection already in progress, skipping...');
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
      console.log('Current microphone permission:', currentPermission);

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
      console.log('Microphone permission granted');

      setIsLoading(true);
      setPhase('connecting');

      try {
        console.log('Fetching LiveKit token for interview:', interviewRef.current.id);
        const response = await InterviewService.getLiveKitToken(interviewRef.current.id);
        const tokenData = response.data.data as LiveKitTokenResponse;
        console.log('LiveKit token received, room:', tokenData.roomName);
        setLiveKitToken(tokenData);
        setPhase('active');
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to connect to voice room');
        handleError(error);
        setPhase('active'); // Fall back to text-only mode
        throw error;
      } finally {
        setIsLoading(false);
      }
    } finally {
      isConnectingVoiceRef.current = false;
    }
  }, [handleError]);

  /**
   * Send a text message to the AI
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!interviewRef.current) {
        handleError(new Error('No active interview'));
        return;
      }

      // Generate unique temp ID
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Optimistically add user message
      const tempUserMessage: InterviewMessage = {
        id: tempId,
        interviewId: interviewRef.current.id,
        role: 'user' as MessageRole,
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      try {
        const response = await InterviewService.sendMessage(interviewRef.current.id, {
          content,
          type: 'text',
        });

        // Backend returns the AI message
        const aiMessage = response.data.data as InterviewMessage;

        setMessages((prev) => {
          // Remove temp message and add actual user message (via refresh) + AI response
          const filtered = prev.filter((m) => m.id !== tempId);
          
          // Convert temp to permanent
          filtered.push({
            ...tempUserMessage,
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          });
          
          // Add AI response
          if (aiMessage) {
            filtered.push(aiMessage);
          }
          
          return filtered;
        });
        
        lastMessageCountRef.current = (lastMessageCountRef.current || 0) + 2;
      } catch (err) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        const error = err instanceof Error ? err : new Error('Failed to send message');
        handleError(error);
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

    setIsLoading(true);
    setPhase('ending');

    try {
      const response = await InterviewService.endInterview(interviewRef.current.id);
      const evalData = response.data.data as InterviewEvaluation;
      setEvaluation(evalData);
      setPhase('completed');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to end interview');
      handleError(error);
      setPhase('active');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  /**
   * Refresh messages from server (for polling)
   * Only fetches if message count changed to reduce network load
   */
  const refreshMessages = useCallback(async () => {
    if (!interviewRef.current) return;

    try {
      const response = await InterviewService.getChatHistory(interviewRef.current.id);
      const newMessages = response.data.data as InterviewMessage[];
      
      // Only update state if messages actually changed
      if (newMessages.length !== lastMessageCountRef.current) {
        setMessages(newMessages);
        lastMessageCountRef.current = newMessages.length;
      }
    } catch (err) {
      console.warn('Failed to refresh messages:', err);
    }
  }, []);

  /**
   * Add a message locally (for voice transcripts)
   */
  const addLocalMessage = useCallback((role: MessageRole, content: string) => {
    if (!interviewRef.current) return;

    const newMessage: InterviewMessage = {
      id: `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      interviewId: interviewRef.current.id,
      role,
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => {
      // Check if message already exists (avoid duplicates)
      const exists = prev.some(
        (m) => m.content === content && m.role === role && Date.now() - new Date(m.createdAt).getTime() < 5000
      );
      if (exists) return prev;
      lastMessageCountRef.current = prev.length + 1;
      return [...prev, newMessage];
    });
  }, []);

  // Poll for new messages when in active phase
  // Using a longer interval (10s) to reduce network load
  // Voice transcripts come via LiveKit data channel in real-time
  useEffect(() => {
    if (phase !== 'active') return;

    const interval = setInterval(() => {
      refreshMessages();
    }, 10000); // 10 seconds instead of 3

    return () => clearInterval(interval);
  }, [phase, refreshMessages]);

  return {
    phase,
    interview,
    messages,
    liveKitToken,
    evaluation,
    isLoading,
    error,
    startInterview,
    connectVoice,
    sendMessage,
    endInterview,
    refreshMessages,
    addLocalMessage,
    setPhase,
  };
}
