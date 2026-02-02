'use client';

import { useEffect, useCallback } from 'react';
import { useDataChannel, useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';

interface DataChannelHandlerProps {
  onTranscript?: (role: 'user' | 'assistant', content: string) => void;
  onAgentReady?: () => void;
  onAgentError?: (error: string) => void;
}

interface TranscriptMessage {
  type: 'transcript';
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AgentStatusMessage {
  type: 'agent_status';
  status: 'ready' | 'error' | 'typing' | 'idle';
  message?: string;
}

type DataChannelMessage = TranscriptMessage | AgentStatusMessage;

/**
 * Handles LiveKit data channel messages from the AI agent
 * Receives real-time transcripts and status updates
 */
export function DataChannelHandler({
  onTranscript,
  onAgentReady,
  onAgentError,
}: DataChannelHandlerProps) {
  const connectionState = useConnectionState();
  const { message } = useDataChannel();

  const handleMessage = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (msg: any) => {
      try {
        let data: DataChannelMessage;

        // Parse message data
        if (typeof msg.payload === 'string') {
          data = JSON.parse(msg.payload) as DataChannelMessage;
        } else {
          // Handle Uint8Array
          const decoder = new TextDecoder();
          data = JSON.parse(decoder.decode(msg.payload)) as DataChannelMessage;
        }

        console.log('Received data channel message:', data);

        switch (data.type) {
          case 'transcript':
            if (data.content) {
              onTranscript?.(data.role, data.content);
            }
            break;

          case 'agent_status':
            switch (data.status) {
              case 'ready':
                onAgentReady?.();
                break;
              case 'error':
                onAgentError?.(data.message || 'Agent error');
                break;
            }
            break;
        }
      } catch (error) {
        console.error('Failed to parse data channel message:', error);
      }
    },
    [onTranscript, onAgentReady, onAgentError]
  );

  useEffect(() => {
    // Only process messages when connected
    if (connectionState !== ConnectionState.Connected) return;
    
    if (message) {
      handleMessage(message);
    }
  }, [message, handleMessage, connectionState]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook to send messages via LiveKit data channel
 * Only works when connected to a room
 */
export function useDataChannelSender() {
  const connectionState = useConnectionState();
  const { send } = useDataChannel('user-input');

  const sendMessage = useCallback(
    (type: string, data: Record<string, unknown>) => {
      // Only send when connected
      if (connectionState !== ConnectionState.Connected) {
        console.warn('Cannot send data channel message: not connected');
        return false;
      }

      try {
        const message = JSON.stringify({ type, ...data });
        const encoder = new TextEncoder();
        const bytes = encoder.encode(message);
        send(bytes, { reliable: true });
        return true;
      } catch (error) {
        console.error('Failed to send data channel message:', error);
        return false;
      }
    },
    [send, connectionState]
  );

  const sendCodeSnapshot = useCallback(
    (code: string, language: string) => {
      return sendMessage('code_snapshot', { code, language, timestamp: Date.now() });
    },
    [sendMessage]
  );

  const sendTranscriptAck = useCallback(
    (messageId: string) => {
      return sendMessage('transcript_ack', { messageId });
    },
    [sendMessage]
  );

  return {
    sendMessage,
    sendCodeSnapshot,
    sendTranscriptAck,
  };
}
