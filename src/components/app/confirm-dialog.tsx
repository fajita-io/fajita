"use client";

import { useState } from "react";

import { Dialog } from "./dialog";
import { BrandButton } from "@/components/design-system/primitives";

/**
 * Confirmation for destructive or sensitive actions. Supports an optional typed
 * confirmation (e.g. type the organization name), a loading state, and
 * double-submit prevention. Distinguishes destructive intent visually.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  requireTyped,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  /** When set, the confirm button stays disabled until this exact text is typed. */
  requireTyped?: string;
}) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = !busy && (!requireTyped || typed === requireTyped);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      setTyped("");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not work. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={title} description={description} size="sm">
      {requireTyped ? (
        <div className="fj-field" style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="confirm-typed">
            Type <strong>{requireTyped}</strong> to confirm
          </label>
          <input
            id="confirm-typed"
            className="fj-input"
            value={typed}
            autoComplete="off"
            onChange={(e) => setTyped(e.target.value)}
          />
        </div>
      ) : null}

      {error ? (
        <div className="fj-form-status fj-form-status--error" role="alert" style={{ marginBottom: "var(--space-4)" }}>
          {error}
        </div>
      ) : null}

      <div className="fj-dialog__actions">
        <BrandButton variant="ghost" onClick={onClose} disabled={busy}>
          Cancel
        </BrandButton>
        <BrandButton
          variant={destructive ? "primary" : "primary"}
          className={destructive ? "fj-button--danger" : undefined}
          onClick={handleConfirm}
          disabled={!canConfirm}
        >
          {busy ? "Working…" : confirmLabel}
        </BrandButton>
      </div>
    </Dialog>
  );
}
