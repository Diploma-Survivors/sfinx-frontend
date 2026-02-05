'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useDataChannel, useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';

interface DataChannelHandlerProps {
  onTranscript?: (
    role: 'user' | 'assistant',
    content: string,
    messageId?: string
  ) => void;
  onTranscriptDelta?: (
    role: 'assistant',
    delta: string,
    messageId: string
  ) => void;
  onAgentReady?: () => void;
  onAgentError?: (error: string) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
}

interface TranscriptMessage {
  type: 'transcript';
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  messageId?: string;
  isFinal?: boolean;
}

interface TranscriptDeltaMessage {
  type: 'transcript_delta';
  role: 'assistant';
  delta: string;
  messageId: string;
  timestamp: number;
}

interface AgentStatusMessage {
  type: 'agent_status';
  status: 'ready' | 'error' | 'typing_start' | 'typing_end' | 'idle';
  message?: string;
}

type DataChannelMessage =
  | TranscriptMessage
  | TranscriptDeltaMessage
  | AgentStatusMessage;

/**
 * Handles LiveKit data channel messages from the AI agent
 */
export function DataChannelHandler({
  onTranscript,
  onTranscriptDelta,
  onAgentReady,
  onAgentError,
  onTypingStart,
  onTypingEnd,
}: DataChannelHandlerProps) {
  const connectionState = useConnectionState();
  const { message } = useDataChannel();

  // Track processed message IDs to avoid duplicates
  const processedMessagesRef = useRef<Set<string>>(new Set());

  const handleMessage = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (msg: any) => {
      try {
        let data: DataChannelMessage;

        // Parse message data
        if (typeof msg.payload === 'string') {
          data = JSON.parse(msg.payload) as DataChannelMessage;
        } else if (msg.payload instanceof Uint8Array) {
          const decoder = new TextDecoder();
          data = JSON.parse(decoder.decode(msg.payload)) as DataChannelMessage;
        } else {
          console.warn(
            '[DataChannel] Unknown payload type:',
            typeof msg.payload
          );
          return;
        }

        console.log('[DataChannel] Received:', data.type, data);

        switch (data.type) {
          case 'transcript':
            if (data.content) {
              // Check for duplicates
              if (
                data.messageId &&
                processedMessagesRef.current.has(data.messageId)
              ) {
                console.log(
                  '[DataChannel] Duplicate message, ignoring:',
                  data.messageId
                );
                return;
              }

              if (data.messageId) {
                processedMessagesRef.current.add(data.messageId);
              }

              console.log(
                '[DataChannel] Calling onTranscript:',
                data.role,
                data.content.substring(0, 50)
              );
              onTranscript?.(data.role, data.content, data.messageId);
            }
            break;

          case 'transcript_delta':
            if (data.delta && data.messageId) {
              console.log(
                '[DataChannel] Calling onTranscriptDelta:',
                data.delta
              );
              onTranscriptDelta?.(data.role, data.delta, data.messageId);
            }
            break;

          case 'agent_status':
            console.log('[DataChannel] Agent status:', data.status);
            switch (data.status) {
              case 'ready':
                onAgentReady?.();
                break;
              case 'error':
                onAgentError?.(data.message || 'Agent error');
                break;
              case 'typing_start':
                onTypingStart?.();
                break;
              case 'typing_end':
                onTypingEnd?.();
                break;
            }
            break;

          default:
            console.warn(
              '[DataChannel] Unknown message type:',
              (data as DataChannelMessage).type
            );
        }
      } catch (error) {
        console.error('[DataChannel] Failed to parse message:', error, msg);
      }
    },
    [
      onTranscript,
      onTranscriptDelta,
      onAgentReady,
      onAgentError,
      onTypingStart,
      onTypingEnd,
    ]
  );

  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) {
      console.log('[DataChannel] Not connected, state:', connectionState);
      return;
    }

    if (message) {
      console.log('[DataChannel] Raw message received:', message);
      handleMessage(message);
    }
  }, [message, handleMessage, connectionState]);

  // Cleanup old message IDs periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (processedMessagesRef.current.size > 1000) {
        processedMessagesRef.current.clear();
      }
    }, 60000);

    return () => clearInterval(cleanup);
  }, []);

  return null;
}

/**
 * Hook to send messages via LiveKit data channel
 */
export function useDataChannelSender() {
  const connectionState = useConnectionState();
  const { send } = useDataChannel('user-input');

  const sendMessage = useCallback(
    (
      type: string,
      data: Record<string, unknown>,
      options?: { reliable?: boolean }
    ): boolean => {
      if (connectionState !== ConnectionState.Connected) {
        console.warn('[DataChannel] Cannot send: not connected');
        return false;
      }

      try {
        const message = JSON.stringify({
          type,
          ...data,
          timestamp: Date.now(),
        });
        const encoder = new TextEncoder();
        const bytes = encoder.encode(message);
        send(bytes, { reliable: options?.reliable ?? true });
        return true;
      } catch (error) {
        console.error('[DataChannel] Failed to send:', error);
        return false;
      }
    },
    [send, connectionState]
  );

  const sendCodeSnapshot = useCallback(
    (code: string, language: string) => {
      if (!code || code.trim().length === 0) return false;
      return sendMessage(
        'code_snapshot',
        { code, language, timestamp: Date.now() },
        { reliable: true }
      );
    },
    [sendMessage]
  );

  return {
    isConnected: connectionState === ConnectionState.Connected,
    sendMessage,
    sendCodeSnapshot,
  };
}
