import type { CSSProperties } from "react";

export type LogoTone = "auto" | "light" | "dark" | "mono";

export interface FajitaMarkProps {
  /** Rendered height and width in px. Optically tuned from 16 up. */
  size?: number;
  /**
   * auto: theme tokens (default inside the app)
   * light: for light backgrounds outside themed contexts
   * dark: for dark backgrounds outside themed contexts
   * mono: single ink, inherits currentColor
   */
  tone?: LogoTone;
  /** Accessible name. Pass empty string only when decorative next to the wordmark. */
  label?: string;
  /** Subtle pulse on the ember dot. Off by default; respects reduced motion. */
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

function markColors(tone: LogoTone) {
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
 * The Fajita mark: "the held pulse." A heat spike inside a controlled
 * boundary, with the ember dot rising off the peak: the moment Fajita
 * notices. The same ember dot dots the j in the wordmark.
 *
 * Construction grid: 64x64, boundary radius 16 (the brand radius),
 * stroke 5 at full size. Below 20px use small-size optical variant
 * (heavier stroke, no dot gap) handled automatically.
 */
export function FajitaMark({
  size = 32,
  tone = "auto",
  label = "Fajita",
  animated = false,
  className,
  style,
}: FajitaMarkProps) {
  const { ink, ember } = markColors(tone);
  const small = size < 20;
  const stroke = small ? 6.5 : 5;
  const decorative = label === "";

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={className}
      style={style}
      fill="none"
    >
      <rect
        x="3.5"
        y="3.5"
        width="57"
        height="57"
        rx="16"
        stroke={ink}
        strokeWidth={stroke}
      />
      <path
        d={small ? "M13 42h9l9-17 9 17h11" : "M14 42h9.5L32 25.5 40.5 42H50"}
        stroke={ink}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="32"
        cy={small ? 15 : 15.5}
        r={small ? 5.5 : 4.5}
        fill={ember}
        className={animated ? "fj-mark-dot-animated" : undefined}
        style={
          animated
            ? { transformOrigin: "32px 15.5px", transformBox: "view-box" }
            : undefined
        }
      />
      {animated ? (
        <style>{`
          .fj-mark-dot-animated { animation: fj-pulse 2.8s var(--ease-thermal, ease-in-out) infinite; }
          @media (prefers-reduced-motion: reduce) { .fj-mark-dot-animated { animation: none; } }
        `}</style>
      ) : null}
    </svg>
  );
}
