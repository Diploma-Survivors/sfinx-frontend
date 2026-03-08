"use client";

import { logger } from "@/lib/logger";
import type React from "react";
import { Component, type ReactNode } from "react";

interface LiveKitErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface LiveKitErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error Boundary for LiveKit components.
 *
 * When a LiveKit render error is caught (e.g. "No room provided"), the
 * onError callback fires so the parent can disable voice and clear the
 * token. The boundary then auto-resets on the next tick so children
 * re-render cleanly in text-chat mode — no full-page error screen.
 */
class LiveKitErrorBoundaryComponent extends Component<
  LiveKitErrorBoundaryProps,
  LiveKitErrorBoundaryState
> {
  constructor(props: LiveKitErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): LiveKitErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("LiveKit component error", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error);

    // Auto-reset after parent state (voice disabled + token cleared) settles,
    // so children re-render without the LiveKit room and no error UI is shown.
    setTimeout(() => {
      this.setState({ hasError: false });
    }, 0);
  }

  render() {
    if (this.state.hasError) {
      // Render nothing while waiting for the auto-reset tick.
      return null;
    }
    return this.props.children;
  }
}

export { LiveKitErrorBoundaryComponent as LiveKitErrorBoundary };

/**
 * Hook to handle LiveKit-specific errors
 */
export function useLiveKitErrorHandler(t: any) {
  return {
    handleError: (error: Error) => {
      logger.error("LiveKit connection error", { error: error.message });

      // Return user-friendly error message
      if (error.message.includes("permissions")) {
        return t(
          "live.mic_permission_denied",
          "Microphone permission denied. Please allow access and try again.",
        );
      }
      if (error.message.includes("network")) {
        return t(
          "live.network_error",
          "Network error. Please check your connection.",
        );
      }
      if (error.message.includes("token")) {
        return t(
          "live.session_expired",
          "Session expired. Please refresh the page.",
        );
      }

      return t(
        "live.voice_connection_failed",
        "Voice connection failed. Falling back to text mode.",
      );
    },
  };
}
