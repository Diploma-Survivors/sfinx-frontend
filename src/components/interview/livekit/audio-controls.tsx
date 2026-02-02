'use client';

import { useState, useCallback } from 'react';
import { useLocalParticipant, useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

interface AudioControlsProps {
  onEndCall?: () => void;
  disabled?: boolean;
}

/**
 * Audio controls for LiveKit voice connection
 * Handles mute/unmute and end call functionality
 */
export function AudioControls({ onEndCall, disabled = false }: AudioControlsProps) {
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const [isLoading, setIsLoading] = useState(false);

  // Check if connected and microphone is enabled
  const isConnected = connectionState === ConnectionState.Connected;
  const isMicrophoneEnabled = localParticipant?.isMicrophoneEnabled ?? false;

  const toggleMicrophone = useCallback(async () => {
    if (!localParticipant || isLoading || disabled || !isConnected) return;

    setIsLoading(true);
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    } finally {
      setIsLoading(false);
    }
  }, [localParticipant, isMicrophoneEnabled, isLoading, disabled, isConnected]);

  const handleEndCall = useCallback(() => {
    if (disabled) return;
    onEndCall?.();
  }, [onEndCall, disabled]);

  // If not connected, show disabled state
  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Tooltip content="Voice not connected">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            disabled
          >
            <MicOff className="h-4 w-4 text-muted-foreground" />
          </Button>
        </Tooltip>

        <Tooltip content="End interview">
          <Button
            variant="destructive"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={handleEndCall}
            disabled={disabled}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Microphone Toggle */}
      <Tooltip content={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}>
        <Button
          variant={isMicrophoneEnabled ? 'default' : 'destructive'}
          size="sm"
          className="h-9 w-9 p-0"
          onClick={toggleMicrophone}
          disabled={isLoading || disabled || !localParticipant}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isMicrophoneEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>
      </Tooltip>

      {/* End Call */}
      <Tooltip content="End interview">
        <Button
          variant="destructive"
          size="sm"
          className="h-9 w-9 p-0"
          onClick={handleEndCall}
          disabled={disabled}
        >
          <PhoneOff className="h-4 w-4" />
        </Button>
      </Tooltip>
    </div>
  );
}

/**
 * Standalone microphone toggle button for use in header
 */
export function MicToggleButton({ disabled = false }: { disabled?: boolean }) {
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const [isLoading, setIsLoading] = useState(false);

  const isConnected = connectionState === ConnectionState.Connected;
  const isMicrophoneEnabled = localParticipant?.isMicrophoneEnabled ?? false;

  const toggleMicrophone = useCallback(async () => {
    if (!localParticipant || isLoading || disabled || !isConnected) return;

    setIsLoading(true);
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    } finally {
      setIsLoading(false);
    }
  }, [localParticipant, isMicrophoneEnabled, isLoading, disabled, isConnected]);

  // Show disabled state if not connected
  if (!isConnected) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5"
        disabled
      >
        <MicOff className="h-3.5 w-3.5" />
        Voice Off
      </Button>
    );
  }

  return (
    <Button
      variant={isMicrophoneEnabled ? 'default' : 'outline'}
      size="sm"
      className="h-8 text-xs gap-1.5"
      onClick={toggleMicrophone}
      disabled={isLoading || disabled || !localParticipant}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isMicrophoneEnabled ? (
        <Mic className="h-3.5 w-3.5" />
      ) : (
        <MicOff className="h-3.5 w-3.5" />
      )}
      {isMicrophoneEnabled ? 'Voice On' : 'Voice Off'}
    </Button>
  );
}
