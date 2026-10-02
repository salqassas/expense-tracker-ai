"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckIcon, AlertIcon, XIcon } from "./Icons";

type ToastVariant = "success" | "error" | "info";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
}

interface ToastOptions {
  variant?: ToastVariant;
  action?: ToastAction;
  durationMs?: number;
}

const ToastContext = createContext<((message: string, options?: ToastOptions) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, { variant = "success", action, durationMs = 4000 }: ToastOptions = {}) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-2), { id, message, variant, action }]);
      window.setTimeout(() => dismiss(id), action ? Math.max(durationMs, 6000) : durationMs);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
          >
            <span
              className={
                t.variant === "error"
                  ? "text-red-400"
                  : t.variant === "info"
                    ? "text-sky-400"
                    : "text-emerald-400"
              }
            >
              {t.variant === "error" ? <AlertIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
            </span>
            <p className="flex-1">{t.message}</p>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
                className="rounded-md px-2 py-1 font-semibold text-brand-300 hover:bg-white/10"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Dismiss notification"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
