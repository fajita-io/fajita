"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";

import { BrandIcon } from "@/components/design-system/icons";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog. Traps focus, restores focus to the trigger on close,
 * closes on Escape and backdrop click, labels itself for screen readers. Used
 * for every confirmation and form dialog in the app; we never use window.confirm.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  const focusFirst = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const target = panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
    target.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    focusFirst();
    document.body.dataset.dialogOpen = "true";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      delete document.body.dataset.dialogOpen;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose, focusFirst]);

  if (!open) return null;

  return (
    <div
      className="fj-dialog__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={`fj-dialog fj-dialog--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
      >
        <div className="fj-dialog__head">
          <h2 id={titleId} className="fj-dialog__title">
            {title}
          </h2>
          <button
            type="button"
            className="fj-icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <BrandIcon name="close" size={16} />
          </button>
        </div>
        {description ? (
          <p id={descId} className="fj-dialog__desc">
            {description}
          </p>
        ) : null}
        <div className="fj-dialog__body">{children}</div>
      </div>
    </div>
  );
}
