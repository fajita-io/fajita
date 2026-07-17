"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { BrandIcon } from "@/components/design-system/icons";

type ToastKind = "success" | "error" | "info";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  show: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let counter = 0;

/**
 * Toasts for brief, non-critical feedback (saves, small errors). Never used for
 * destructive confirmation or security-critical errors. Announced politely to
 * assistive tech; auto-dismiss after a few seconds, dismissible by button.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = (counter += 1);
      setToasts((list) => [...list, { id, kind, message }]);
      window.setTimeout(() => remove(id), 5000);
    },
    [remove],
  );

  const api: ToastApi = {
    show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fj-toasts" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`fj-toast fj-toast--${t.kind}`} role="status">
            <BrandIcon
              name={t.kind === "success" ? "check" : t.kind === "error" ? "warning" : "bell"}
              size={16}
            />
            <span>{t.message}</span>
            <button
              type="button"
              className="fj-toast__close"
              aria-label="Dismiss"
              onClick={() => remove(t.id)}
            >
              <BrandIcon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
