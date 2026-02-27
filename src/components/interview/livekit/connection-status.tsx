"use client";

import { cn } from "@/lib/utils";
import { useConnectionState } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { AlertCircle, Loader2, Wifi, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConnectionStatusProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Displays LiveKit connection status with appropriate icon and color
 */
export function ConnectionStatus({
  className,
  showLabel = true,
}: ConnectionStatusProps) {
  const connectionState = useConnectionState();
  const { t } = useTranslation("interview");

  // Don't render anything if disconnected
  if (connectionState === ConnectionState.Disconnected) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
          "bg-muted text-muted-foreground",
          className,
        )}
      >
        <WifiOff className="h-3.5 w-3.5" />
        {showLabel && <span>{t("livekit.voice_off")}</span>}
      </div>
    );
  }

  const statusConfig = {
    [ConnectionState.Connecting]: {
      icon: Loader2,
      label: t("livekit.connecting"),
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      animate: true,
    },
    [ConnectionState.Connected]: {
      icon: Wifi,
      label: t("livekit.voice_connected"),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      animate: false,
    },
    [ConnectionState.Reconnecting]: {
      icon: Loader2,
      label: t("livekit.reconnecting"),
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      animate: true,
    },
    [ConnectionState.SignalReconnecting]: {
      icon: Loader2,
      label: t("livekit.reconnecting"),
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      animate: true,
    },
  };

  const config =
    statusConfig[connectionState] || statusConfig[ConnectionState.Connecting];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
        config.bgColor,
        config.color,
        className,
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", config.animate && "animate-spin")} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}

/**
 * Compact status indicator (just a dot)
 */
export function ConnectionDot({ className }: { className?: string }) {
  const connectionState = useConnectionState();

  const colorClass =
    connectionState === ConnectionState.Connected
      ? "bg-green-500"
      : connectionState === ConnectionState.Connecting ||
          connectionState === ConnectionState.Reconnecting ||
          connectionState === ConnectionState.SignalReconnecting
        ? "bg-yellow-500 animate-pulse"
        : "bg-gray-400";

  return (
    <div
      className={cn("h-2 w-2 rounded-full", colorClass, className)}
      title={connectionState}
    />
  );
}

/**
 * Alert banner for connection issues
 */
export function ConnectionAlert() {
  const connectionState = useConnectionState();
  const { t } = useTranslation("interview");

  // Don't show alert when disconnected (that's the default state)
  if (
    connectionState === ConnectionState.Disconnected ||
    connectionState === ConnectionState.Connected
  ) {
    return null;
  }

  const messages = {
    [ConnectionState.Connecting]: t("livekit.connecting"),
    [ConnectionState.Reconnecting]: t("livekit.reconnecting"),
    [ConnectionState.SignalReconnecting]: t("livekit.reconnecting"),
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-xs rounded-md",
        "bg-yellow-500/10 text-yellow-600",
      )}
    >
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{messages[connectionState] || t("livekit.connecting")}</span>
    </div>
  );
}
