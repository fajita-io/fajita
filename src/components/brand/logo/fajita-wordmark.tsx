import type { CSSProperties } from "react";

import wordmark from "./wordmark-data.json";
import type { LogoTone } from "./fajita-mark";

export interface FajitaWordmarkProps {
  /** Rendered text height in px (full glyph box). Default 28. */
  height?: number;
  tone?: LogoTone;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

function wordmarkColors(tone: LogoTone) {
  switch (tone) {
    case "light":
      return { ink: "#17130e", ember: "#d9480f" };
    case "dark":
      return { ink: "#faf5ea", ember: "#f5921b" };
    case "mono":
      return { ink: "currentColor", ember: "currentColor" };
    default:
      return {
        ink: "var(--color-text-primary, #17130e)",
        ember: "var(--color-brand-ember, #d9480f)",
      };
  }
}

/**
 * The Fajita wordmark: custom-set Fraunces display instance with the j's
 * tittle replaced by the ember dot, the same dot that crowns the mark.
 * Outlines are baked vector paths (no font dependency at render time).
 * Never stretch, recolor arbitrarily, or reset in a different font.
 */
export function FajitaWordmark({
  height = 28,
  tone = "auto",
  label = "Fajita",
  className,
  style,
}: FajitaWordmarkProps) {
  const { ink, ember } = wordmarkColors(tone);
  const width = (wordmark.width / wordmark.height) * height;
  const decorative = label === "";

  return (
    <svg
      viewBox={`0 0 ${wordmark.width} ${wordmark.height}`}
      width={width}
      height={height}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={className}
      style={style}
    >
      {wordmark.paths.map((d, i) => (
        <path key={i} d={d} fill={ink} />
      ))}
      <circle
        cx={wordmark.emberDot.cx}
        cy={wordmark.emberDot.cy}
        r={wordmark.emberDot.r * 1.12}
        fill={ember}
      />
    </svg>
  );
}
