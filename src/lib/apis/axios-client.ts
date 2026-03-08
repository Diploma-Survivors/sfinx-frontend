'use client';

import { toastService } from '@/services/toasts-service';
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const clientApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/v1', // Replace with your API base URL
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

clientApi.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

async function triggerNextAuthRefresh() {
  // 1. Get a fresh CSRF Token (Required for POST requests to NextAuth)
  const csrfRes = await fetch('/api/auth/csrf');
  const csrfData = await csrfRes.json();

  // 2. POST to session endpoint to trigger 'jwt' callback with 'update'
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      csrfToken: csrfData.csrfToken,
      data: { action: 'refresh' }, // This 'data' becomes 'session' in auth.ts
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to update session');
  }

  return await res.json(); // Returns the new session
}

interface RetryQueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}

let isRefreshing = false;
let failedQueue: RetryQueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  for (const prom of failedQueue) {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  }
  failedQueue = [];
};

// Optional: Add response interceptors
clientApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // --- LOGIC: HANDLE 401 (Token Expired) ---
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // A. If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return clientApi(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // B. If not refreshing, start the refresh process
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newSession = await triggerNextAuthRefresh();

        if (newSession?.accessToken && !newSession.error) {
          // 1. Process queue with new token
          processQueue(null, newSession.accessToken);

          // 2. Update current request and retry
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newSession.accessToken}`;
          }
          return clientApi(originalRequest);
        }
        throw new Error('Failed to refresh session');
      } catch (refreshError) {
        // Refresh failed (Refresh token expired too?)
        processQueue(refreshError, null);

        // Force Logout
        await signOut({ callbackUrl: '/login' });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --- LOGIC: GLOBAL ERROR HANDLING (For non-recoverable errors) ---
    if (error.response) {
      const status = error.response.status;
      const message =
        (error.response?.data as any)?.error ||
        error.message ||
        'An error occurred';

      // We handled 401 above. If we reach here with 401, it means refresh failed.
      switch (status) {
        case 403: // Forbidden (User logged in but doesn't have permission)
          window.location.href = '/unauthorized'; // Or use Next.js router if available
          break;
        case 404: // Not Found
          // Optional: Only redirect on specific 404s, or just show toast
          // window.location.href = '/not-found';
          toastService.error(`Resource not found: ${message}`);
          break;
        case 500:
          toastService.error('Server error. Please try again later.');
          break;
        default:
          // Don't show toast for 401 as we might be redirecting
          if (status !== 401) {
            toastService.error(message);
          }
          break;
      }
    } else {
      // Network errors (no response)
      toastService.error('Network Error: Please check your connection.');
    }
    return Promise.reject(error);
  }
);

export default clientApi;
