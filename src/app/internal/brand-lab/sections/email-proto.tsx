import { LabSection } from "./lab-ui";

/**
 * Email prototypes: table-based, email-client-safe markup with system-safe
 * fallback fonts (web fonts are unreliable in email). Rendered here for
 * art direction; actual sending templates ship in a later phase via Resend.
 * Spec in docs/brand/fajita-email-branding.md.
 */
function EmailShell({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      style={{
        width: "100%",
        maxWidth: 560,
        borderCollapse: "collapse",
        background: "#fffdf7",
        border: "1px solid #e6dac3",
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "-apple-system, 'Segoe UI', helvetica, arial, sans-serif",
        color: "#17130e",
      }}
    >
      <tbody>
        <tr>
          <td style={{ padding: "20px 32px", borderBottom: "3px solid #b53a0a" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logos/fajita-logo-horizontal.svg"
              alt="Fajita"
              width={110}
              height={26}
              style={{ display: "block" }}
            />
          </td>
        </tr>
        <tr>
          <td style={{ padding: "28px 32px" }}>{children}</td>
        </tr>
        <tr>
          <td
            style={{
              padding: "16px 32px",
              borderTop: "1px solid #e6dac3",
              fontSize: 12,
              lineHeight: 1.6,
              color: "#5c544a",
            }}
          >
            Fajita · 1001 S Main St, Ste 600, Kalispell, MT 59901
            <br />
            You receive incident emails because you are on the Acme on-call
            list. Manage notifications in Settings.
            <br />
            <span style={{ color: "#8a8070" }}>Preview text: {preview}</span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmailSection() {
  return (
    <LabSection
      id="email"
      title="Email brand foundation"
      note="Operational emails are calm, factual, and nearly graphic-free: logo, one ember rule, plain hierarchy, one action. Table-based markup with system font fallbacks for client compatibility. Plain-text alternatives are part of the template spec."
    >
      <div style={{ display: "grid", gap: "var(--space-8)", justifyItems: "start" }}>
        <figure style={{ margin: 0, width: "100%" }}>
          <figcaption className="fj-label" style={{ marginBottom: "var(--space-3)" }}>
            Incident opened (urgent, zero decoration)
          </figcaption>
          <EmailShell preview="checkout.acme.dev is down. Confirmed from 3 regions.">
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#c92a2a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Incident · Down
            </p>
            <h1 style={{ margin: "8px 0 0", fontSize: 22, lineHeight: 1.25 }}>
              checkout.acme.dev is not responding
            </h1>
            <p style={{ margin: "16px 0 0", fontSize: 15, lineHeight: 1.6 }}>
              Confirmed at 14:02 UTC from 3 of 3 regions. Last successful check
              was 14:00 UTC (184ms). The failing check timed out after 30
              seconds.
            </p>
            <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "20px 0 0" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      background: "#b53a0a",
                      borderRadius: 8,
                      padding: "12px 20px",
                    }}
                  >
                    <a
                      href="https://fajita.io"
                      style={{ color: "#ffffff", textDecoration: "none", fontWeight: 600, fontSize: 14 }}
                    >
                      Open incident
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </EmailShell>
        </figure>

        <figure style={{ margin: 0, width: "100%" }}>
          <figcaption className="fj-label" style={{ marginBottom: "var(--space-3)" }}>
            Welcome (warmer, still concise)
          </figcaption>
          <EmailShell preview="Your first monitor takes about a minute.">
            <h1 style={{ margin: 0, fontSize: 22, lineHeight: 1.25 }}>
              Welcome to Fajita
            </h1>
            <p style={{ margin: "16px 0 0", fontSize: 15, lineHeight: 1.6 }}>
              You now have a smoke alarm for your software. Add your first
              monitor and Fajita starts checking every 30 seconds, from
              multiple regions, verifying before it ever wakes you up.
            </p>
            <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "20px 0 0" }}>
              <tbody>
                <tr>
                  <td style={{ background: "#b53a0a", borderRadius: 8, padding: "12px 20px" }}>
                    <a
                      href="https://fajita.io"
                      style={{ color: "#ffffff", textDecoration: "none", fontWeight: 600, fontSize: 14 }}
                    >
                      Create your first monitor
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <p style={{ margin: "20px 0 0", fontSize: 13, color: "#5c544a", lineHeight: 1.6 }}>
              Prefer to look around first? Every plan includes status pages,
              SSL and cron monitoring, and alerts to email, Slack, or webhooks.
            </p>
          </EmailShell>
        </figure>
      </div>
    </LabSection>
  );
}
