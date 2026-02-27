"use client";

import type { LiveKitTokenResponse } from "@/types/interview";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from "@livekit/components-react";
import { Room } from "livekit-client";
import { type ReactNode, useCallback, useEffect, useState } from "react";

interface LiveKitProviderProps {
  token: LiveKitTokenResponse | null;
  children: ReactNode;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Inner component that handles room connection/disconnection
 */
function RoomConnector({
  shouldConnect,
  onConnected,
  onDisconnected,
}: {
  shouldConnect: boolean;
  onConnected?: () => void;
  onDisconnected?: () => void;
}) {
  const room = useRoomContext();

  useEffect(() => {
    console.log("[RoomConnector] Effect:", {
      shouldConnect,
      state: room.state,
    });

    if (shouldConnect) {
      if (room.state === "disconnected") {
        console.log("[RoomConnector] Connecting...");
        // The room will auto-connect via LiveKitRoom's connect prop
      }
    } else {
      if (room.state === "connected" || room.state === "connecting") {
        console.log("[RoomConnector] Disconnecting...");
        room.disconnect();
      }
    }
  }, [shouldConnect, room]);

  // Track connection state changes
  useEffect(() => {
    const handleConnected = () => {
      console.log("[RoomConnector] Room connected");
      onConnected?.();
    };
    const handleDisconnected = () => {
      console.log("[RoomConnector] Room disconnected");
      onDisconnected?.();
    };

    room.on("connected", handleConnected);
    room.on("disconnected", handleDisconnected);

    return () => {
      room.off("connected", handleConnected);
      room.off("disconnected", handleDisconnected);
    };
  }, [room, onConnected, onDisconnected]);

  return null;
}

/**
 * LiveKit Provider - Manages voice connection for interview
 */
export function LiveKitProvider({
  token,
  children,
  onConnected,
  onDisconnected,
  onError,
}: LiveKitProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset connection attempts when token changes
  useEffect(() => {
    setConnectionAttempts(0);
  }, [token?.token]);

  const handleConnected = useCallback(() => {
    setConnectionAttempts(0);
    console.log("[LiveKitProvider] Connected callback");
    onConnected?.();
  }, [onConnected]);

  const handleDisconnected = useCallback(() => {
    console.log("[LiveKitProvider] Disconnected callback");
    onDisconnected?.();
  }, [onDisconnected]);

  const handleError = useCallback(
    (error: Error) => {
      console.error("[LiveKitProvider] Error:", error);
      setConnectionAttempts((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          onError?.(error);
        }
        return next;
      });
    },
    [onError],
  );

  // Prevent SSR issues
  if (!isClient) {
    return <>{children}</>;
  }

  // If no token, render children without LiveKitRoom
  // This completely removes the room and triggers disconnection
  if (!token) {
    console.log("[LiveKitProvider] No token, rendering without LiveKit");
    return <>{children}</>;
  }

  const maxRetries = 3;
  const shouldConnect = connectionAttempts < maxRetries;

  console.log("[LiveKitProvider] Rendering with token:", {
    roomName: token.roomName,
    shouldConnect,
    connectionAttempts,
  });

  return (
    <LiveKitRoom
      serverUrl={token.url}
      token={token.token}
      connect={shouldConnect}
      audio={true}
      video={false}
      options={{
        adaptiveStream: true,
        dynacast: true,
      }}
      onError={handleError}
      data-lk-theme="default"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <RoomConnector
        shouldConnect={shouldConnect}
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
      />
      {shouldConnect && <RoomAudioRenderer />}
      {children}
    </LiveKitRoom>
  );
}
