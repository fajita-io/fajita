import type { CSSProperties } from "react";

import { StatusIcon } from "./status-icon";
import { statusSpecs, type OperationalStatus } from "./status";

export interface StatusBadgeProps {
  status: OperationalStatus;
  /** Override the default label (e.g. "All systems operational"). */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/** Pill badge: icon + label + state color. Never color-only. */
export function StatusBadge({ status, label, className, style }: StatusBadgeProps) {
  const spec = statusSpecs[status];
  const vars = {
    "--status-text": spec.text,
    "--status-bold": spec.bold,
    "--status-soft": spec.soft,
  } as CSSProperties;

  return (
    <span
      className={`fj-status-badge${className ? ` ${className}` : ""}`}
      style={{ ...vars, ...style }}
    >
      <StatusIcon status={status} size={14} />
      {label ?? spec.label}
    </span>
  );
}

export interface StatusDotProps {
  status: OperationalStatus;
  /** Gentle pulse for live surfaces. Reduced motion disables it. */
  live?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Bare dot for dense tables and lists. Must always sit next to a visible
 * text label; it carries aria-hidden and is never the only signal.
 */
export function StatusDot({ status, live = false, className, style }: StatusDotProps) {
  const spec = statusSpecs[status];
  return (
    <span
      aria-hidden
      className={`fj-status-dot${live ? " fj-status-dot--live" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--status-bold": spec.bold, ...style } as CSSProperties}
    />
  );
}
