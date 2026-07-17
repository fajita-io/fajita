import type { Metadata } from "next";

import {
  OpsBreadcrumbs,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
  OpsStatus,
} from "@/components/platform/ops-ui";
import { SCALE_LAB_FIXTURES } from "@/lib/scale/fixtures";
import { buildFixtureScorecards } from "@/lib/scale/channels";
import { formatUsdCents } from "@/lib/billing/mrr";

export const metadata: Metadata = {
  title: "Scale lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Fixture-only demonstrations. Development or platform access via layout.
 * Never loads production customer data.
 */
export default function ScaleLabPage() {
  const f = SCALE_LAB_FIXTURES;
  const scorecards = buildFixtureScorecards();

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Scale lab" },
        ]}
      />
      <OpsPageHeader
        title="Scale operations lab"
        deck="Deterministic fixtures for gate, channel, capacity, hiring, and fraud scenarios. No production data."
      />

      <OpsPanel title="Gate scenarios">
        <div className="fj-ops-grid">
          <div className="fj-ops-card">
            <div className="fj-ops-card__label">Not eligible</div>
            <OpsStatus state="major_outage" />
            <div className="fj-ops-card__meta">{f.notEligibleGate.reason}</div>
          </div>
          <div className="fj-ops-card">
            <div className="fj-ops-card__label">Eligible limited (fixture)</div>
            <OpsStatus state="degraded" />
            <div className="fj-ops-card__meta">{f.eligibleLimitedGate.reason}</div>
          </div>
        </div>
      </OpsPanel>

      <OpsPanel title="Channel quality fixtures">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Activated</th>
              <th>Day 7</th>
              <th>Refunds</th>
              <th>Support</th>
              <th>Retained CAC</th>
            </tr>
          </thead>
          <tbody>
            {scorecards.map((s) => (
              <tr key={s.channel.key}>
                <td>{s.channel.name}</td>
                <td>{s.activatedOrganizations}</td>
                <td>{s.day7Retained}</td>
                <td>{formatUsdCents(s.refundsCents)}</td>
                <td>{s.supportContacts}</td>
                <td>
                  {s.retainedCacCents == null
                    ? "—"
                    : formatUsdCents(s.retainedCacCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

      <OpsPanel title="Scenario keys">
        <div className="fj-ops-grid">
          {(
            [
              ["Referral abuse", f.referralAbuse.referralCode],
              ["Capacity warning", f.capacityWarning.level],
              ["Worker saturation", f.workerSaturation.level],
              ["Support backlog", String(f.supportBacklog.openConversations)],
              ["Concentration", `${Math.round(f.concentrationRisk.channelShareOfNewMrr * 100)}%`],
              ["Fraud event", f.fraudEvent.type],
              ["Paused campaign", f.pausedCampaign.status],
              ["Hiring trigger", f.hiringTrigger.satisfied ? "yes" : "no"],
            ] as const
          ).map(([label, value]) => (
            <OpsMetricCard
              key={label}
              label={label}
              value={value}
              completeness="complete"
              meta="fixture"
            />
          ))}
        </div>
      </OpsPanel>

      <OpsPanel title="Accessibility checks for operators">
        <ul>
          <li>Mobile emergency view: use ops shell responsive layout</li>
          <li>Dark mode: theme toggle in shell</li>
          <li>Reduced motion: respect prefers-reduced-motion globally</li>
          <li>200% zoom: tables scroll inside panels, no page overflow target</li>
        </ul>
      </OpsPanel>
    </>
  );
}
