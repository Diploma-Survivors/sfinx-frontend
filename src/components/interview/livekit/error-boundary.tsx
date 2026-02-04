'use client';

import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { AlertCircle } from 'lucide-react';
import type React from 'react';
import { Component, type ReactNode } from 'react';

interface LiveKitErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface LiveKitErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary for LiveKit components
 *
 * Catches errors in the LiveKit component tree and provides a fallback UI.
 * This prevents the entire interview page from crashing if the voice
 * connection fails.
 */
export class LiveKitErrorBoundary extends Component<
  LiveKitErrorBoundaryProps,
  LiveKitErrorBoundaryState
> {
  constructor(props: LiveKitErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): LiveKitErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('LiveKit component error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Voice Connection Error</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            We encountered an issue with the voice connection. You can continue
            with text-based chat or try reconnecting.
          </p>
          <div className="flex gap-2">
            <Button onClick={this.handleRetry} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to handle LiveKit-specific errors
 */
export function useLiveKitErrorHandler() {
  return {
    handleError: (error: Error) => {
      logger.error('LiveKit connection error', { error: error.message });

      // Return user-friendly error message
      if (error.message.includes('permissions')) {
        return 'Microphone permission denied. Please allow access and try again.';
      }
      if (error.message.includes('network')) {
        return 'Network error. Please check your connection.';
      }
      if (error.message.includes('token')) {
        return 'Session expired. Please refresh the page.';
      }

      return 'Voice connection failed. Falling back to text mode.';
    },
  };
}
