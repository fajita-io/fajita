import { LabSection } from "./lab-ui";

const EMAIL = {
  cream: "#fffdf7",
  creamInset: "#faf5ea",
  carbon: "#17130e",
  body: "#333330",
  muted: "#6f6a60",
  faint: "#8a8578",
  footerMuted: "#5c544a",
  border: "#e8e2d4",
  ember: "#b53a0a",
  pepper: "#a61e1e",
  surface: "#ffffff",
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const;

function MemoTag() {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} align="center" style={{ margin: "20px auto 0" }}>
      <tbody>
        <tr>
          <td align="center">
            <a
              href="https://memo.ly"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  border: "1px solid #e0e0db",
                  borderRadius: 999,
                  background: "#f9f9f7",
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: "7px 14px 7px 10px" }}>
                      <table role="presentation" cellPadding={0} cellSpacing={0}>
                        <tbody>
                          <tr>
                            <td style={{ verticalAlign: "middle", lineHeight: 0, paddingRight: 8 }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src="/brand/email/memo-icon.png"
                                width={18}
                                height={18}
                                alt=""
                                style={{ display: "block", borderRadius: 4 }}
                              />
                            </td>
                            <td
                              style={{
                                fontFamily: EMAIL.font,
                                fontSize: 13,
                                lineHeight: 1.2,
                                color: "#666666",
                                whiteSpace: "nowrap",
                                verticalAlign: "middle",
                              }}
                            >
                              Powered by <strong style={{ color: "#111111", fontWeight: 700 }}>Memo</strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function FajitaHeader() {
  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
      <tbody>
        <tr>
          <td style={{ verticalAlign: "middle" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/email/fajita-logo-header-dark.png"
              width={110}
              height={38}
              alt="Fajita"
              style={{ display: "block" }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function EmailShell({
  preview,
  headerRight,
  children,
  footer,
}: {
  preview: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
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
        background: EMAIL.surface,
        border: `1px solid ${EMAIL.border}`,
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: EMAIL.font,
        color: EMAIL.carbon,
      }}
    >
      <tbody>
        <tr>
          <td style={{ padding: "18px 28px", background: EMAIL.carbon }}>
            <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle" }}>
                    <FajitaHeader />
                  </td>
                  {headerRight ? (
                    <td align="right" style={{ verticalAlign: "middle" }}>
                      {headerRight}
                    </td>
                  ) : null}
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td style={{ padding: "32px 32px 28px" }}>{children}</td>
        </tr>
        <tr>
          <td
            style={{
              padding: "20px 32px 24px",
              background: EMAIL.creamInset,
              borderTop: `1px solid ${EMAIL.border}`,
              fontSize: 12,
              lineHeight: 1.6,
              color: EMAIL.footerMuted,
            }}
          >
            {footer}
            <MemoTag />
            <p style={{ margin: "12px 0 0", fontSize: 11, color: EMAIL.faint }}>
              Preview text: {preview}
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function EmberButton({ label }: { label: string }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ margin: "24px 0 8px" }}>
      <tbody>
        <tr>
          <td align="center" style={{ borderRadius: 10, background: EMAIL.ember }}>
            <a
              href="https://fajita.io"
              style={{
                display: "block",
                padding: "14px 24px",
                fontSize: 15,
                fontWeight: 700,
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: 10,
                textAlign: "center",
              }}
            >
              {label}
            </a>
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
      note="Card layout on cream: dark header, white body, inset footer, centered Memo tag. Table-based markup with system font fallbacks. Plain-text alternatives ship with every send."
    >
      <div style={{ display: "grid", gap: "var(--space-8)", justifyItems: "start", background: EMAIL.cream, padding: "var(--space-6)", borderRadius: 8 }}>
        <figure style={{ margin: 0, width: "100%" }}>
          <figcaption className="fj-label" style={{ marginBottom: "var(--space-3)" }}>
            Incident opened (urgent, zero decoration)
          </figcaption>
          <EmailShell
            preview="checkout.acme.dev is down. Confirmed from 3 regions."
            footer={
              <>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: EMAIL.muted }}>
                  Questions? Reply to this email or visit{" "}
                  <a href="https://fajita.io/contact" style={{ color: EMAIL.carbon, textDecoration: "underline" }}>
                    fajita.io/contact
                  </a>
                  .
                </p>
                <p style={{ margin: 0, fontSize: 12, color: EMAIL.faint }}>
                  Fajita · 1001 S Main St, Ste 600, Kalispell, MT 59901 ·{" "}
                  <a href="https://fajita.io" style={{ color: EMAIL.faint, textDecoration: "underline" }}>
                    fajita.io
                  </a>
                </p>
              </>
            }
          >
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: EMAIL.pepper, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Incident · Down
            </p>
            <h1 style={{ margin: "8px 0 0", fontSize: 22, lineHeight: 1.25, fontWeight: 700 }}>
              checkout.acme.dev is not responding
            </h1>
            <p style={{ margin: "16px 0 0", fontSize: 15, lineHeight: 1.6, color: EMAIL.body }}>
              Confirmed at 14:02 UTC from 3 of 3 regions. Last successful check
              was 14:00 UTC (184ms). The failing check timed out after 30
              seconds.
            </p>
            <EmberButton label="Open incident" />
          </EmailShell>
        </figure>

        <figure style={{ margin: 0, width: "100%" }}>
          <figcaption className="fj-label" style={{ marginBottom: "var(--space-3)" }}>
            Welcome (warmer, still concise)
          </figcaption>
          <EmailShell
            preview="Your first monitor takes about a minute."
            headerRight={
              <span style={{ fontSize: 13, color: "#b8ae9c", fontFamily: EMAIL.font }}>
                Canyon Software
              </span>
            }
            footer={
              <>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: EMAIL.footerMuted }}>
                  This is a service message about your Fajita account.
                </p>
                <p style={{ margin: 0, fontSize: 12, color: EMAIL.faint }}>
                  Fajita · 1001 S Main St, Ste 600, Kalispell, MT 59901
                </p>
              </>
            }
          >
            <h1 style={{ margin: 0, fontSize: 24, lineHeight: 1.25, fontWeight: 700 }}>
              Welcome to Fajita
            </h1>
            <p style={{ margin: "16px 0 0", fontSize: 15, lineHeight: 1.6, color: EMAIL.body }}>
              You now have a smoke alarm for your software. Add your first
              monitor and Fajita starts checking every 30 seconds, from
              multiple regions, verifying before it ever wakes you up.
            </p>
            <EmberButton label="Create your first monitor" />
            <p style={{ margin: "20px 0 0", fontSize: 13, color: EMAIL.footerMuted, lineHeight: 1.6 }}>
              Prefer to look around first? Every plan includes status pages,
              SSL and cron monitoring, and alerts to email, Slack, or webhooks.
            </p>
          </EmailShell>
        </figure>
      </div>
    </LabSection>
  );
}
