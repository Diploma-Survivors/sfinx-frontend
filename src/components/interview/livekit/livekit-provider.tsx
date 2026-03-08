"use client";

import type { LiveKitTokenResponse } from "@/types/interview";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { type ReactNode, useEffect, useState } from "react";

interface LiveKitProviderProps {
  token: LiveKitTokenResponse | null;
  audioEnabled: boolean;
  children: ReactNode;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

function RoomConnector({
  onConnected,
  onDisconnected,
}: {
  onConnected?: () => void;
  onDisconnected?: () => void;
}) {
  const room = useRoomContext();

  useEffect(() => {
    room.on("connected", onConnected!);
    room.on("disconnected", onDisconnected!);
    return () => {
      room.off("connected", onConnected!);
      room.off("disconnected", onDisconnected!);
    };
  }, [room, onConnected, onDisconnected]);

  return null;
}

/**
 * Explicitly enables/disables the local microphone track when audioEnabled
 * changes. LiveKit's <LiveKitRoom audio={...}> prop controls the initial
 * publish state; this component keeps it in sync after the room is connected.
 */
function MicController({ audioEnabled }: { audioEnabled: boolean }) {
  const room = useRoomContext();

  useEffect(() => {
    if (room.state !== ConnectionState.Connected) return;
    room.localParticipant.setMicrophoneEnabled(audioEnabled).catch(() => {});
  }, [room, room.state, audioEnabled]);

  return null;
}

export function LiveKitProvider({
  token,
  audioEnabled,
  children,
  onConnected,
  onDisconnected,
  onError,
}: LiveKitProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !token) {
    return <>{children}</>;
  }

  return (
    <LiveKitRoom
      serverUrl={token.url}
      token={token.token}
      connect={true}
      audio={audioEnabled}
      video={false}
      options={{ adaptiveStream: true, dynacast: true }}
      onError={onError}
      data-lk-theme="default"
      style={{ width: "100%", height: "100%" }}
    >
      <RoomConnector onConnected={onConnected} onDisconnected={onDisconnected} />
      <MicController audioEnabled={audioEnabled} />
      {audioEnabled && <RoomAudioRenderer />}
      {children}
    </LiveKitRoom>
  );
}
