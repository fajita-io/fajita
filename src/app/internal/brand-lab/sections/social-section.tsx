import { LabGrid, LabSection } from "./lab-ui";

/* eslint-disable @next/next/no-img-element */

const assets = [
  { src: "/brand/social/og-template.svg", label: "Open Graph template (1200x630)", wide: true },
  { src: "/brand/social/x-header.svg", label: "X header (1500x500)", wide: true },
  { src: "/brand/icons/social-avatar.svg", label: "Profile avatar (X, LinkedIn, Product Hunt)" },
  { src: "/brand/icons/app-icon.svg", label: "App icon / favicon tile" },
  { src: "/brand/email/email-header.svg", label: "Email header (600x96)", wide: true },
  { src: "/brand/logos/fajita-logo-horizontal.svg", label: "Horizontal logo, light" },
  { src: "/brand/logos/fajita-logo-stacked.svg", label: "Stacked logo, light" },
  { src: "/brand/logos/fajita-wordmark.svg", label: "Wordmark, light" },
];

export function SocialSection() {
  return (
    <LabSection
      id="social"
      title="Social and platform assets"
      note="All files are generated from one source of truth (scripts/export-brand-assets.ts reads the same path data as the React components). Raster exports for platforms that reject SVG are produced from these files; export procedure in docs/brand/fajita-social-assets.md."
    >
      <LabGrid min="18rem">
        {assets.map((a) => (
          <figure key={a.src} style={{ margin: 0, gridColumn: a.wide ? "1 / -1" : undefined }}>
            <div
              style={{
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                background: "var(--color-background-inset)",
                padding: "var(--space-4)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <img
                src={a.src}
                alt={a.label}
                style={{ maxWidth: a.wide ? "100%" : "10rem", display: "block" }}
              />
            </div>
            <figcaption className="fj-caption" style={{ marginTop: "var(--space-2)" }}>
              {a.label} · <span className="fj-mono">{a.src}</span>
            </figcaption>
          </figure>
        ))}
      </LabGrid>
    </LabSection>
  );
}
