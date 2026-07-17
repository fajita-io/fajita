import { LabSection } from "./lab-ui";

const roles = [
  { cls: "fj-display-1", name: "Display 1 · Fraunces 560, opsz 144", text: "Know when your software gets too hot." },
  { cls: "fj-display-2", name: "Display 2", text: "Catch the outage while it is still warming up." },
  { cls: "fj-heading-1", name: "Heading 1 · Fraunces, opsz 40", text: "Verified before anyone gets woken up" },
  { cls: "fj-heading-2", name: "Heading 2", text: "Every check, every 30 seconds" },
  { cls: "fj-heading-3", name: "Heading 3 · Instrument Sans 600", text: "Alert channels" },
  { cls: "fj-body-lg", name: "Body large", text: "Fajita monitors your websites, APIs, certificates, and cron jobs. When something starts cooking, your team hears about it before your customers do." },
  { cls: "fj-body", name: "Body", text: "A check failed once from Frankfurt. Fajita re-checked from Virginia and Singapore before opening an incident, so nobody got paged for a network blip." },
  { cls: "fj-label", name: "Label · Instrument Sans 500", text: "Response time (p95)" },
  { cls: "fj-caption", name: "Caption", text: "Last checked 28 seconds ago" },
  { cls: "fj-eyebrow", name: "Eyebrow · Spline Sans Mono", text: "Status pages" },
];

export function TypeSection() {
  return (
    <LabSection
      id="typography"
      title="Typography"
      note="Three commissioned roles: Fraunces (display, optical sizing on), Instrument Sans (interface and reading), Spline Sans Mono (technical accent). All OFL-licensed, self-hosted via next/font. Scale is fluid between 360 and 1440. Full spec in docs/brand/fajita-typography.md."
    >
      <div style={{ display: "grid", gap: "var(--space-6)" }}>
        {roles.map((r) => (
          <figure key={r.cls} style={{ margin: 0 }}>
            <figcaption className="fj-caption fj-mono" style={{ marginBottom: "var(--space-1)" }}>
              {r.name} · .{r.cls}
            </figcaption>
            <p className={r.cls} style={{ margin: 0 }}>{r.text}</p>
          </figure>
        ))}
        <figure style={{ margin: 0 }}>
          <figcaption className="fj-caption fj-mono" style={{ marginBottom: "var(--space-1)" }}>
            Numeric · tabular figures · .fj-numeric
          </figcaption>
          <p className="fj-numeric" style={{ margin: 0, fontSize: "var(--text-heading-2)" }}>
            99.982% · 184ms · 90 days
          </p>
        </figure>
        <figure style={{ margin: 0 }}>
          <figcaption className="fj-caption fj-mono" style={{ marginBottom: "var(--space-1)" }}>
            Technical accent · .fj-mono
          </figcaption>
          <p className="fj-mono" style={{ margin: 0 }}>
            GET https://api.acme.dev/health → 200 in 184ms
          </p>
        </figure>
      </div>
    </LabSection>
  );
}
