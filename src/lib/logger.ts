/**
 * Production Logger
 *
 * Provides consistent logging across the application with:
 * - Environment-aware log levels (debug in dev, warn/error in prod)
 * - Structured logging for better analytics
 * - Rate limiting to prevent log spam
 * - Sensitive data redaction
 */

import { useCallback } from 'react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  component?: string;
}

// Configuration
const CONFIG = {
  // In production, only log warn and above
  minLevel: (process.env.NODE_ENV === 'production'
    ? 'warn'
    : 'debug') as LogLevel,
  // Rate limiting: max logs per minute
  maxLogsPerMinute: 100,
  // Components to suppress in production
  suppressedComponents: ['LiveKit', 'DataChannel'],
};

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Rate limiting state
let logCount = 0;
let lastReset = Date.now();

/**
 * Check if we should rate limit this log
 */
function shouldRateLimit(): boolean {
  const now = Date.now();
  if (now - lastReset > 60000) {
    logCount = 0;
    lastReset = now;
  }
  logCount++;
  return logCount > CONFIG.maxLogsPerMinute;
}

/**
 * Redact sensitive information from log context
 */
function redactSensitive(context?: LogContext): LogContext | undefined {
  if (!context) return context;

  const sensitiveKeys = [
    'token',
    'password',
    'secret',
    'apiKey',
    'api_key',
    'auth',
  ];
  const redacted: LogContext = {};

  for (const [key, value] of Object.entries(context)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitive(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Core logging function
 */
function log(
  level: LogLevel,
  message: string,
  context?: LogContext,
  component?: string
): void {
  // Check minimum level
  if (LEVELS[level] < LEVELS[CONFIG.minLevel]) {
    return;
  }

  // Check if component is suppressed
  if (
    component &&
    CONFIG.suppressedComponents.includes(component) &&
    process.env.NODE_ENV === 'production'
  ) {
    return;
  }

  // Rate limiting
  if (shouldRateLimit()) {
    if (level === 'error') {
      // eslint-disable-next-line no-console
      console.error('[Logger] Rate limit exceeded, suppressing logs');
    }
    return;
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: redactSensitive(context),
    component,
  };

  // Log to console with appropriate method
  const prefix = component ? `[${component}]` : '[sFinx]';
  const logMessage = `${prefix} ${message}`;

  switch (level) {
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug(logMessage, context ? '' : '', context || '');
      break;
    case 'info':
      // eslint-disable-next-line no-console
      console.info(logMessage, context ? '' : '', context || '');
      break;
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(logMessage, context ? '' : '', context || '');
      break;
    case 'error':
      // eslint-disable-next-line no-console
      console.error(logMessage, context ? '' : '', context || '');
      break;
  }

  // In production, you might want to send to a logging service
  // e.g., Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production' && level === 'error') {
    // TODO: Send to error tracking service
    // sendToErrorTracking(entry);
  }
}

/**
 * Logger instance with component context
 */
export class Logger {
  constructor(private component: string) {}

  debug(message: string, context?: LogContext): void {
    log('debug', message, context, this.component);
  }

  info(message: string, context?: LogContext): void {
    log('info', message, context, this.component);
  }

  warn(message: string, context?: LogContext): void {
    log('warn', message, context, this.component);
  }

  error(message: string, context?: LogContext): void {
    log('error', message, context, this.component);
  }
}

/**
 * Hook to create a logger with component context
 */
export function useLogger(component: string) {
  return useCallback(() => new Logger(component), [component]);
}

/**
 * Static logger for use outside of React components
 */
export const logger = {
  debug: (message: string, context?: LogContext) =>
    log('debug', message, context),
  info: (message: string, context?: LogContext) =>
    log('info', message, context),
  warn: (message: string, context?: LogContext) =>
    log('warn', message, context),
  error: (message: string, context?: LogContext) =>
    log('error', message, context),
};
