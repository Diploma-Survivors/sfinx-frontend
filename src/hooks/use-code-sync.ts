'use client';

import { useEffect, useRef, useCallback } from 'react';
import { InterviewService } from '@/services/interview-service';

interface UseCodeSyncOptions {
  interviewId: string | null;
  code: string;
  language: string;
  enabled: boolean;
  intervalMs?: number;
}

/**
 * Hook to periodically sync code snapshots to backend
 * This allows the AI agent to see the user's current code
 * 
 * Optimizations:
 * - Only syncs when code has changed
 * - Skips empty code
 * - Uses longer intervals (10s default)
 * - Debounces rapid changes
 */
export function useCodeSync(options: UseCodeSyncOptions): void {
  const { interviewId, code, language, enabled, intervalMs = 10000 } = options;

  // Refs to avoid re-triggering effect
  const codeRef = useRef(code);
  const languageRef = useRef(language);
  const lastSyncRef = useRef<number>(0);
  const lastCodeRef = useRef<string>('');

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
      console.warn('Code sync failed:', error);
    }
  }, [interviewId, enabled, intervalMs]);

  // Periodic sync
  useEffect(() => {
    if (!enabled || !interviewId) return;

    const interval = setInterval(() => {
      syncCode();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, interviewId, intervalMs, syncCode]);

  // Sync on code change (debounced, only if significant)
  useEffect(() => {
    if (!enabled || !interviewId || !code) return;

    // Skip if code hasn't changed meaningfully
    if (code === lastCodeRef.current) return;

    const timeout = setTimeout(() => {
      syncCode();
    }, 2000); // 2s debounce

    return () => clearTimeout(timeout);
  }, [code, enabled, interviewId, syncCode]);
}
