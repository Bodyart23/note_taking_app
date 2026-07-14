"use client";

import { Check, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

type ShowToastOptions = {
  message: string;
  action?: ToastAction;
};

type ToastItem = ShowToastOptions & {
  id: string;
};

type ToastContextValue = {
  showToast: (options: ShowToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ message, action }: ShowToastOptions) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, action }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {mounted
        ? createPortal(
            <div
              className="pointer-events-none fixed top-4 right-4 z-[60] flex w-[min(100%-2rem,28rem)] flex-col items-stretch gap-2 sm:top-6 sm:right-6"
              aria-live="polite"
              aria-relevant="additions"
            >
              {toasts.map((toast) => (
                <ToastBar
                  key={toast.id}
                  toast={toast}
                  onDismiss={() => dismissToast(toast.id)}
                />
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

function ToastBar({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg"
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success"
        aria-hidden="true"
      >
        <Check className="h-3 w-3 text-white" strokeWidth={3} />
      </span>

      <p className="min-w-0 flex-1 text-sm text-foreground">{toast.message}</p>

      {toast.action ? (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss();
          }}
          className="shrink-0 text-sm font-medium text-foreground underline underline-offset-2 transition-opacity hover:opacity-70"
        >
          {toast.action.label}
        </button>
      ) : null}

      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-0.5 text-muted transition-colors hover:text-foreground"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
