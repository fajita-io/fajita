import { ImageResponse } from "next/og";

export const contentOgSize = { width: 1200, height: 630 };
export const contentOgContentType = "image/png";

const BG = "#0b0d12";
const ACCENT = "#e89158";
const MUTED = "#b8b5af";
const TEXT = "#f4f4f2";

export interface ContentOgOptions {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

/** Dynamic OG card for editorial, docs, glossary, and comparison pages. */
export function contentOgImage(options: ContentOgOptions): ImageResponse {
  const { eyebrow, title, subtitle } = options;
  const displayTitle = title.length > 72 ? `${title.slice(0, 69)}…` : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: "72px",
          color: TEXT,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: ACCENT,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: "1000px",
            }}
          >
            {displayTitle}
          </div>
          {subtitle ? (
            <div style={{ fontSize: 30, lineHeight: 1.35, color: MUTED, maxWidth: "920px" }}>
              {subtitle.length > 120 ? `${subtitle.slice(0, 117)}…` : subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: MUTED,
          }}
        >
          <span>Fajita</span>
          <span>fajita.io</span>
        </div>
      </div>
    ),
    contentOgSize,
  );
}
