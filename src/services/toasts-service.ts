'use client';

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

class ToastService {
  private listeners: Array<(message: string, type: ToastType) => void> = [];

  subscribe(listener: (message: string, type: ToastType) => void) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(message: string, type: ToastType) {
    for (const listener of this.listeners) {
      listener(message, type);
    }
  }

  success(message: string) {
    this.notify(message, ToastType.SUCCESS);
  }

  error(message: string) {
    this.notify(message, ToastType.ERROR);
  }

  warning(message: string) {
    this.notify(message, ToastType.WARNING);
  }

  info(message: string) {
    this.notify(message, ToastType.INFO);
  }
}

export const toastService = new ToastService();
