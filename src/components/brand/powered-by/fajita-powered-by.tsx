import type { CSSProperties } from "react";

import { FajitaMark, type LogoTone } from "../logo/fajita-mark";

export interface FajitaPoweredByProps {
  tone?: LogoTone;
  /** Optional link target. Defaults to the Fajita homepage. */
  href?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * "Powered by Fajita" attribution lockup for customer status pages.
 * Deliberately quiet: it must never compete with the customer's brand.
 * When a page is also produced with Pamphlet, place the two lockups on
 * one row separated by at least 24px; never merge them into one phrase.
 */
export function FajitaPoweredBy({
  tone = "auto",
  href = "https://fajita.io",
  className,
  style,
}: FajitaPoweredByProps) {
  const color =
    tone === "light"
      ? "#5c544a"
      : tone === "dark"
        ? "#c8b99d"
        : tone === "mono"
          ? "currentColor"
          : "var(--color-text-muted, #5c544a)";

  return (
    <a
      href={href}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5em",
        fontFamily: "var(--font-sans, sans-serif)",
        fontSize: "0.8125rem",
        fontWeight: 500,
        color,
        textDecoration: "none",
        ...style,
      }}
    >
      <FajitaMark size={16} tone={tone} label="" />
      <span>
        Powered by <span style={{ fontWeight: 600 }}>Fajita</span>
      </span>
    </a>
  );
}
