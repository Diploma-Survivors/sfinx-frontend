'use client';

import { InterviewService } from '@/services/interview-service';
import { useCallback, useEffect, useRef } from 'react';

interface UseCodeSyncOptions {
  interviewId: string | null;
  code: string;
  language: string;
  enabled: boolean;
  intervalMs?: number;
}

/**
 * @deprecated This hook is deprecated. Code is now sent with every message via the
 * `sendMessage(content, { code, language })` API. This provides better consistency
 * and eliminates the need for periodic syncing.
 *
 * For voice-only mode, use the data channel to send code snapshots when needed:
 * ```
 * const { sendCodeSnapshot } = useDataChannelSender();
 * sendCodeSnapshot(code, language);
 * ```
 *
 * This hook is kept for backwards compatibility but should not be used in new code.
 */
export function useCodeSync(options: UseCodeSyncOptions): void {
  const { interviewId, code, language, enabled, intervalMs = 30000 } = options;

  // Refs to avoid re-triggering effect
  const codeRef = useRef(code);
  const languageRef = useRef(language);
  const lastSyncRef = useRef<number>(0);
  const lastCodeRef = useRef<string>('');
  const warnedRef = useRef(false);

  // Warn once about deprecation
  useEffect(() => {
    if (!warnedRef.current && enabled) {
      // eslint-disable-next-line no-console
      console.warn(
        '[useCodeSync] This hook is deprecated. ' +
          'Code should be sent with messages via sendMessage(content, { code, language })'
      );
      warnedRef.current = true;
    }
  }, [enabled]);

  // Update refs
  codeRef.current = code;
  languageRef.current = language;

  const syncCode = useCallback(async () => {
    if (!interviewId || !enabled) return;

    const currentCode = codeRef.current;
    const currentLang = languageRef.current;

    // Skip if code is empty or hasn't changed
    if (!currentCode || currentCode === lastCodeRef.current) return;

    // Don't sync if synced recently
    const now = Date.now();
    if (now - lastSyncRef.current < intervalMs) return;

    try {
      await InterviewService.syncCodeSnapshot(interviewId, {
        code: currentCode,
        language: currentLang,
        timestamp: now,
      });
      lastSyncRef.current = now;
      lastCodeRef.current = currentCode;
    } catch (error) {
      // Silently fail - code sync is non-critical
      // eslint-disable-next-line no-console
      console.warn('[useCodeSync] Code sync failed:', error);
    }
  }, [interviewId, enabled, intervalMs]);

  // Periodic sync (much longer interval now that code is sent with messages)
  useEffect(() => {
    if (!enabled || !interviewId) return;

    const interval = setInterval(() => {
      syncCode();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, interviewId, intervalMs, syncCode]);
}
