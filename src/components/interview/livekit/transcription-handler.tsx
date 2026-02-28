'use client';

import { useEffect, useRef } from 'react';
import {
  useConnectionState,
  useRoomContext,
} from '@livekit/components-react';
import {
  ConnectionState,
  RoomEvent,
  type Participant,
  type TrackPublication,
  type TranscriptionSegment,
} from 'livekit-client';

interface TranscriptionHandlerProps {
  onTranscript?: (
    role: 'user' | 'assistant',
    content: string,
    messageId?: string
  ) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
}

/**
 * Handles LiveKit's built-in transcription events from the Agents framework.
 *
 * The LiveKit Agents SDK automatically forwards STT (user speech) and
 * LLM/TTS (agent speech) transcriptions via RoomEvent.TranscriptionReceived.
 * This replaces the custom DataChannelHandler approach.
 */
export function TranscriptionHandler({
  onTranscript,
  onTypingStart,
  onTypingEnd,
}: TranscriptionHandlerProps) {
  const room = useRoomContext();
  const connectionState = useConnectionState();

  const processedFinalRef = useRef<Set<string>>(new Set());
  const agentSpeakingRef = useRef(false);

  useEffect(() => {
    if (connectionState !== ConnectionState.Connected || !room) {
      return;
    }

    const handleTranscription = (
      segments: TranscriptionSegment[],
      participant?: Participant,
      _publication?: TrackPublication,
    ) => {
      const isAgent = participant?.isAgent ?? false;
      const role: 'user' | 'assistant' = isAgent ? 'assistant' : 'user';

      for (const segment of segments) {
        if (!segment.text || segment.text.trim().length === 0) continue;

        if (role === 'assistant') {
          if (!segment.final) {
            if (!agentSpeakingRef.current) {
              agentSpeakingRef.current = true;
              onTypingStart?.();
            }
            // Each non-final segment contains the FULL accumulated text,
            // not an incremental delta. addLocalMessage upserts by ID,
            // so calling onTranscript replaces the message content each time.
            onTranscript?.('assistant', segment.text, segment.id);
          } else {
            if (processedFinalRef.current.has(segment.id)) continue;
            processedFinalRef.current.add(segment.id);

            if (agentSpeakingRef.current) {
              agentSpeakingRef.current = false;
              onTypingEnd?.();
            }
            onTranscript?.('assistant', segment.text, segment.id);
          }
        } else {
          if (segment.final) {
            if (processedFinalRef.current.has(segment.id)) continue;
            processedFinalRef.current.add(segment.id);
            onTranscript?.('user', segment.text, segment.id);
          }
        }
      }
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);

    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [
    room,
    connectionState,
    onTranscript,
    onTypingStart,
    onTypingEnd,
  ]);

  // Periodically clean up old processed IDs
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (processedFinalRef.current.size > 500) {
        processedFinalRef.current.clear();
      }
    }, 60000);

    return () => clearInterval(cleanup);
  }, []);

  return null;
}
