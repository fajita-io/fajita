import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, AppSection } from "@/components/app/ui";
import {
  commissionFixtures,
  DEMO_AFFILIATES,
  payoutEligibilityFixtures,
  programLabSummary,
  reversalFixtures,
} from "@/lib/affiliates/fixtures";
import {
  previewAffiliateNotification,
  type AffiliateNotificationKind,
} from "@/lib/affiliates/notifications";

export const metadata: Metadata = {
  title: "Affiliate lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const NOTIFICATION_KINDS: AffiliateNotificationKind[] = [
  "approved",
  "first_commission",
  "payout_sent",
  "account_closed",
];

export default function AffiliateLabPage() {
  const program = programLabSummary();
  const commissions = commissionFixtures();
  const reversals = reversalFixtures();
  const eligibility = payoutEligibilityFixtures();

  const notifications = NOTIFICATION_KINDS.map((kind) => ({
    kind,
    email: previewAffiliateNotification(
      kind,
      kind === "approved"
        ? { defaultLink: "https://fajita.io/?ref=northstar" }
        : kind === "payout_sent"
          ? { amount: "$86.00" }
          : {},
    ),
  }));

  return (
    <>
      <PageHeader
        title="Affiliate lab"
        description="Deterministic fixtures and previews. Nothing here writes to the database or sends email."
      />

      <p className="fj-body-sm">
        <Link href="/internal/affiliates">Back to affiliate operations</Link>
      </p>

      <AppSection
        title="Program terms"
        description={
          program.programPublished
            ? "Published. Customer surfaces show these terms."
            : "Not published. Customer surfaces stay gated."
        }
      >
        <dl className="fj-detail-grid">
          <div>
            <dt className="fj-admin-table__secondary">Version</dt>
            <dd>
              {program.version} · {program.label}
            </dd>
          </div>
          <div>
            <dt className="fj-admin-table__secondary">Commission</dt>
            <dd>{program.commissionRate}</dd>
          </div>
          <div>
            <dt className="fj-admin-table__secondary">Attribution</dt>
            <dd>{program.attributionWindowDays} days</dd>
          </div>
          <div>
            <dt className="fj-admin-table__secondary">Recurring</dt>
            <dd>{program.recurringMonths} months</dd>
          </div>
          <div>
            <dt className="fj-admin-table__secondary">Holding</dt>
            <dd>{program.holdingDays} days</dd>
          </div>
          <div>
            <dt className="fj-admin-table__secondary">Payout minimum</dt>
            <dd>{formatUsd(program.thresholdCents)}</dd>
          </div>
          <div>
            <dt className="fj-admin-table__secondary">Eligible plans</dt>
            <dd>{program.eligiblePlans.join(", ")}</dd>
          </div>
          <div>
            <dt className="fj-admin-table__secondary">Currency</dt>
            <dd>{program.currency.toUpperCase()}</dd>
          </div>
        </dl>
      </AppSection>

      <AppSection title="Commission calculator fixtures">
        <table className="fj-admin-table">
          <thead>
            <tr>
              <th scope="col">Scenario</th>
              <th scope="col">Paid</th>
              <th scope="col">Tax</th>
              <th scope="col">Commission</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id}>
                <td>{c.label}</td>
                <td>{formatUsd(c.amountPaidCents)}</td>
                <td>{formatUsd(c.taxCents)}</td>
                <td>{formatUsd(c.expectedCommissionCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AppSection>

      <AppSection title="Reversal fixtures">
        <table className="fj-admin-table">
          <thead>
            <tr>
              <th scope="col">Scenario</th>
              <th scope="col">Refunded</th>
              <th scope="col">Delta reversed</th>
            </tr>
          </thead>
          <tbody>
            {reversals.map((r) => (
              <tr key={r.id}>
                <td>{r.label}</td>
                <td>{formatUsd(r.refundedCents)}</td>
                <td>{formatUsd(r.expectedDeltaCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AppSection>

      <AppSection title="Payout eligibility matrix">
        <table className="fj-admin-table">
          <thead>
            <tr>
              <th scope="col">Scenario</th>
              <th scope="col">Resolved status</th>
            </tr>
          </thead>
          <tbody>
            {eligibility.map((e) => (
              <tr key={e.id}>
                <td>{e.label}</td>
                <td>{e.expected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AppSection>

      <AppSection
        title="Demo directory (synthetic)"
        description="Storytelling rows only. Never written to Supabase."
      >
        <table className="fj-admin-table">
          <thead>
            <tr>
              <th scope="col">Code</th>
              <th scope="col">State</th>
              <th scope="col">Payable</th>
              <th scope="col">Conversions</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_AFFILIATES.map((a) => (
              <tr key={a.code}>
                <td>{a.code}</td>
                <td>
                  {a.membershipState}
                  {a.fraudState !== "clear" ? ` · fraud:${a.fraudState}` : ""}
                </td>
                <td>{formatUsd(a.payableCents)}</td>
                <td>{a.conversions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AppSection>

      <AppSection
        title="Notification previews"
        description="Rendered HTML. Nothing is sent from this page."
      >
        <div className="fj-snippet-list">
          {notifications.map((n) => (
            <article key={n.kind} className="fj-snippet">
              <h3 className="fj-copyfield__label">{n.kind}</h3>
              <p className="fj-body-sm">
                <strong>{n.email.subject}</strong>
              </p>
              <iframe
                title={`Preview ${n.kind}`}
                srcDoc={n.email.html}
                sandbox=""
                style={{
                  width: "100%",
                  maxWidth: 640,
                  height: 360,
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "var(--radius-md)",
                  background: "#fff",
                }}
              />
              <pre className="fj-body-sm" style={{ whiteSpace: "pre-wrap" }}>
                {n.email.text}
              </pre>
            </article>
          ))}
        </div>
      </AppSection>
    </>
  );
}
