import { ToastType, toastService } from '@/services/toasts-service';
import { X } from 'lucide-react'; // Assuming you use Lucide or Heroicons
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  useEffect,
} from 'react';

interface Toast {
  id: number;
  message: ReactNode;
  type: ToastType;
}

interface ToastContextType {
  openToast: (message: ReactNode, type?: ToastType, duration?: number) => void;
  success: (message: ReactNode, duration?: number) => void;
  error: (message: ReactNode, duration?: number) => void;
  info: (message: ReactNode, duration?: number) => void;
  warning: (message: ReactNode, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const openToast = useCallback(
    (message: ReactNode, type: ToastType = ToastType.INFO, duration = 5000) => {
      const id = Date.now();
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  useEffect(() => {
    toastService.subscribe(openToast);
  }, [openToast]);

  // Helper functions for cleaner API
  const success = (message: ReactNode, duration?: number) =>
    openToast(message, ToastType.SUCCESS, duration);
  const error = (message: ReactNode, duration?: number) =>
    openToast(message, ToastType.ERROR, duration);
  const info = (message: ReactNode, duration?: number) =>
    openToast(message, ToastType.INFO, duration);
  const warning = (message: ReactNode, duration?: number) =>
    openToast(message, ToastType.WARNING, duration);

  return (
    <ToastContext.Provider value={{ openToast, success, error, info, warning }}>
      {children}

      {/* Toast Container (Fixed to bottom-right) */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex min-w-[300px] items-center justify-between rounded-lg p-4 shadow-lg transition-all animate-in slide-in-from-right-full
              ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
              ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}
              ${toast.type === 'warning' ? 'bg-orange-500 text-white' : ''}
            `}
          >
            <div className="text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 opacity-70 hover:opacity-100"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
