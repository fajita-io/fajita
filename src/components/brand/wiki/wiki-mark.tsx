import type { CSSProperties } from "react";

export interface WikiMarkProps {
  /** Rendered height and width in px. Header uses 32; attribution badge uses 24. */
  size?: number;
  /** Accessible name. Pass empty string when decorative beside visible text. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Wiki product mark from wiki.co header: lime tile with the wiki-glyphs lockup.
 * Asset source: https://wiki.co/icon.svg (stored at /brand/wiki-mark.svg).
 */
export function WikiMark({
  size = 24,
  label = "Wiki",
  className,
  style,
}: WikiMarkProps) {
  const decorative = label === "";

  return (
    <img
      src="/brand/wiki-mark.svg"
      width={size}
      height={size}
      alt={decorative ? "" : label}
      aria-hidden={decorative || undefined}
      className={className}
      style={{
        display: "block",
        flexShrink: 0,
        ...style,
      }}
      draggable={false}
    />
  );
}
