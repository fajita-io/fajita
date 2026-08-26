import type { CSSProperties } from "react";

import { FajitaMark, type LogoTone } from "./fajita-mark";
import { FajitaWordmark } from "./fajita-wordmark";

export interface FajitaLogoProps {
  /** horizontal: mark + wordmark side by side. stacked: mark above wordmark. mark: symbol only. */
  orientation?: "horizontal" | "stacked" | "mark";
  /** Wordmark cap-height driven size in px. Mark scales proportionally. */
  size?: number;
  tone?: LogoTone;
  label?: string;
  /** Enables the ember-dot pulse on the mark. */
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Primary Fajita lockup. Fixed proportions; clearspace equal to the mark's
 * boundary radius is built into usage guidance, not the SVG.
 */
export function FajitaLogo({
  orientation = "horizontal",
  size = 28,
  tone = "auto",
  label = "Fajita",
  animated = false,
  className,
  style,
}: FajitaLogoProps) {
  if (orientation === "mark") {
    return (
      <FajitaMark
        size={size * 1.15}
        tone={tone}
        label={label}
        animated={animated}
        className={className}
        style={style}
      />
    );
  }

  const isStacked = orientation === "stacked";
  const markSize = isStacked ? size * 1.6 : size * 1.15;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: isStacked ? "column" : "row",
        alignItems: "center",
        gap: isStacked ? size * 0.5 : size * 0.42,
        ...style,
      }}
    >
      <FajitaMark size={markSize} tone={tone} label="" animated={animated} />
      <FajitaWordmark height={size} tone={tone} label={label} />
    </span>
  );
}
