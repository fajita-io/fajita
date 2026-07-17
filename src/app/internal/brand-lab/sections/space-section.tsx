import { LabGrid, LabSection, LabSpecimen } from "./lab-ui";

const spaces = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32];
const radii = [
  { token: "--radius-xs", use: "inputs, inline code" },
  { token: "--radius-sm", use: "buttons, small cards" },
  { token: "--radius-md", use: "cards, tiles" },
  { token: "--radius-lg", use: "brand frames, demo frames (signature radius)" },
  { token: "--radius-xl", use: "editorial feature surfaces" },
];

export function SpaceSection() {
  return (
    <LabSection
      id="space"
      title="Spacing, radius, elevation"
      note="4px base scale plus fluid section rhythm. Radius varies by role: the 18px brand radius comes from the mark's boundary (16/64) and belongs to brand and demo frames, never to inputs. Shadows are warm-tinted carbon, three steps, no glows."
    >
      <h3 className="fj-heading-3" style={{ marginBottom: "var(--space-4)" }}>Spacing scale</h3>
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        {spaces.map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <span className="fj-caption fj-mono" style={{ width: "6.5rem" }}>--space-{s}</span>
            <span
              style={{
                display: "inline-block",
                height: "0.875rem",
                width: `var(--space-${s})`,
                background: "var(--color-brand-heat)",
                borderRadius: 2,
              }}
            />
          </div>
        ))}
      </div>

      <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>Radius roles</h3>
      <LabGrid min="12rem">
        {radii.map((r) => (
          <LabSpecimen key={r.token} label={`${r.token} · ${r.use}`}>
            <div
              style={{
                width: "5.5rem",
                height: "3.5rem",
                border: "2px solid var(--color-border-strong)",
                borderRadius: `var(${r.token})`,
              }}
            />
          </LabSpecimen>
        ))}
      </LabGrid>

      <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>Elevation</h3>
      <LabGrid min="12rem">
        {["low", "mid", "high"].map((s) => (
          <LabSpecimen key={s} label={`--shadow-${s}`}>
            <div
              style={{
                width: "5.5rem",
                height: "3.5rem",
                borderRadius: "var(--radius-md)",
                background: "var(--color-background-elevated)",
                boxShadow: `var(--shadow-${s})`,
              }}
            />
          </LabSpecimen>
        ))}
      </LabGrid>
    </LabSection>
  );
}
