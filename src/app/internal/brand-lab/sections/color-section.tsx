import { LabGrid, LabSection } from "./lab-ui";

const foundation = [
  { name: "Cream 50", token: "--fj-cream-50", hex: "#fffdf7" },
  { name: "Cream 100", token: "--fj-cream-100", hex: "#faf5ea" },
  { name: "Cream 200", token: "--fj-cream-200", hex: "#f2ead9" },
  { name: "Cream 300", token: "--fj-cream-300", hex: "#e6dac3" },
  { name: "Sand 400", token: "--fj-sand-400", hex: "#c8b99d" },
  { name: "Taupe 500", token: "--fj-taupe-500", hex: "#8a8070" },
  { name: "Soot 600", token: "--fj-soot-600", hex: "#5c544a" },
  { name: "Soot 700", token: "--fj-soot-700", hex: "#3e382f" },
  { name: "Carbon 800", token: "--fj-carbon-800", hex: "#262119" },
  { name: "Carbon 900", token: "--fj-carbon-900", hex: "#17130e" },
  { name: "Carbon 950", token: "--fj-carbon-950", hex: "#0e0b07" },
];

const heat = [
  { name: "Ember 200", token: "--fj-ember-200", hex: "#ffe3c2" },
  { name: "Ember 300", token: "--fj-ember-300", hex: "#ffc078" },
  { name: "Ember 400", token: "--fj-ember-400", hex: "#f5921b" },
  { name: "Ember 500", token: "--fj-ember-500", hex: "#e8590c" },
  { name: "Ember 600", token: "--fj-ember-600", hex: "#d9480f" },
  { name: "Ember 700", token: "--fj-ember-700", hex: "#b53a0a" },
  { name: "Amber 400", token: "--fj-amber-400", hex: "#f0b429" },
  { name: "Pepper 500", token: "--fj-pepper-500", hex: "#e03131" },
  { name: "Pepper 600", token: "--fj-pepper-600", hex: "#c92a2a" },
];

/* Measured values; regenerate with scripts in docs/brand/fajita-color-system.md */
const contrast = [
  { pair: "Text primary (carbon 900) on cream 50", ratio: "18.17:1", pass: "AAA" },
  { pair: "Text secondary (soot 700) on cream 50", ratio: "11.40:1", pass: "AAA" },
  { pair: "Text muted (soot 600) on cream 50", ratio: "7.32:1", pass: "AAA" },
  { pair: "Brand text (ember 700) on cream 50", ratio: "5.78:1", pass: "AA" },
  { pair: "Status operational (green 800) on cream 50", ratio: "6.01:1", pass: "AA" },
  { pair: "Status down (pepper 600) on cream 50", ratio: "5.37:1", pass: "AA" },
  { pair: "Status degraded (amber 700) on cream 50", ratio: "6.80:1", pass: "AA" },
  { pair: "White on primary button (ember 700)", ratio: "5.88:1", pass: "AA" },
  { pair: "Text primary (cream 100) on carbon 950", ratio: "18.06:1", pass: "AAA" },
  { pair: "Brand text (ember 300) on carbon 950", ratio: "12.21:1", pass: "AAA" },
  { pair: "Status down (pepper 300) on carbon 950", ratio: "10.68:1", pass: "AAA" },
];

function Swatch({ name, token, hex }: { name: string; token: string; hex: string }) {
  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          height: "4.5rem",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border-subtle)",
          background: `var(${token})`,
        }}
      />
      <figcaption style={{ marginTop: "var(--space-2)" }}>
        <span className="fj-label" style={{ display: "block" }}>{name}</span>
        <span className="fj-caption fj-mono">{token} · {hex}</span>
      </figcaption>
    </figure>
  );
}

export function ColorSection() {
  return (
    <LabSection
      id="color"
      title="Color system"
      note="Foundation is warm cream against carbon: tortilla warmth read through a technical lens. Heat is strategic, never ambient: ember belongs to the brand voice and CTAs, amber to verification and degradation, pepper red only to confirmed failure. Full definitions, pairings, and prohibitions in docs/brand/fajita-color-system.md."
    >
      <h3 className="fj-heading-3" style={{ marginBottom: "var(--space-4)" }}>Foundation</h3>
      <LabGrid min="8.5rem">
        {foundation.map((c) => <Swatch key={c.token} {...c} />)}
      </LabGrid>

      <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>Brand heat</h3>
      <LabGrid min="8.5rem">
        {heat.map((c) => <Swatch key={c.token} {...c} />)}
      </LabGrid>

      <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>
        Contrast verification
      </h3>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            fontSize: "var(--text-body-sm)",
          }}
        >
          <thead>
            <tr>
              {["Pairing", "Ratio", "WCAG"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "var(--space-2) var(--space-3)",
                    borderBottom: "1.5px solid var(--color-border-strong)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contrast.map((row) => (
              <tr key={row.pair}>
                <td style={{ padding: "var(--space-2) var(--space-3)", borderBottom: "1px solid var(--color-border-subtle)" }}>
                  {row.pair}
                </td>
                <td className="fj-numeric" style={{ padding: "var(--space-2) var(--space-3)", borderBottom: "1px solid var(--color-border-subtle)" }}>
                  {row.ratio}
                </td>
                <td style={{ padding: "var(--space-2) var(--space-3)", borderBottom: "1px solid var(--color-border-subtle)" }}>
                  {row.pass}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LabSection>
  );
}
