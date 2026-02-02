'use client';

import { ReactNode, useEffect, useState } from 'react';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import type { LiveKitTokenResponse } from '@/types/interview';

interface LiveKitProviderProps {
  token: LiveKitTokenResponse | null;
  children: ReactNode;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

/**
 * LiveKit Provider component that manages the LiveKit room connection
 * Always renders LiveKitRoom to provide context, but only connects when token is available
 */
export function LiveKitProvider({
  token,
  children,
  onConnected,
  onDisconnected,
  onError,
}: LiveKitProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent SSR issues
  if (!isClient) {
    return <>{children}</>;
  }

  // Always render LiveKitRoom to provide context, but only connect when we have a token
  return (
    <LiveKitRoom
      serverUrl={token?.url || ''}
      token={token?.token || ''}
      connect={!!token}
      audio={!!token}
      video={false}
      options={{
        adaptiveStream: true,
        dynacast: true,
      }}
      onConnected={() => {
        console.log('LiveKit connected to room:', token?.roomName);
        onConnected?.();
      }}
      onDisconnected={() => {
        console.log('LiveKit disconnected');
        onDisconnected?.();
      }}
      onError={(error) => {
        console.error('LiveKit error:', error);
        onError?.(error as Error);
      }}
      data-lk-theme="default"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {token && <RoomAudioRenderer />}
      {children}
    </LiveKitRoom>
  );
}
