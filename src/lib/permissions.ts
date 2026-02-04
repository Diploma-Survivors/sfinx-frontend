'use client';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

/**
 * Check microphone permission status
 */
export async function checkMicrophonePermission(): Promise<PermissionState> {
  try {
    // Check if the Permissions API is supported
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });
      return result.state as PermissionState;
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Request microphone permission explicitly
 * Returns true if granted, false if denied
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop all tracks immediately (we just needed permission)
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (err) {
    console.error('Microphone permission error:', err);
    return false;
  }
}

/**
 * Check if we're in a secure context (required for microphone access)
 */
export function isSecureContext(): boolean {
  return window.isSecureContext;
}

/**
 * Get a user-friendly error message for microphone permission denial
 */
export function getMicrophonePermissionErrorMessage(): string {
  return 'Microphone access was denied. Please allow microphone access in your browser settings to use voice mode.';
}
