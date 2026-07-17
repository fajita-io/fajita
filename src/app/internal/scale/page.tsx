import type { Metadata } from "next";
import Link from "next/link";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsLinkButton,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
  OpsStatus,
} from "@/components/platform/ops-ui";
import { evaluateScaleReadiness, gateStatusLabel, getCurrentScaleStage } from "@/lib/scale";

export const metadata: Metadata = {
  title: "Controlled scale",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ScaleHomePage() {
  const readiness = evaluateScaleReadiness();
  const stage = getCurrentScaleStage();

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Scale" },
        ]}
      />
      <OpsPageHeader
        title="Controlled scale"
        deck="Scale channels that produce retained value. Throttle everything else."
        actions={
          <>
            <OpsLinkButton href="/internal/scale/overview" primary>
              Command center
            </OpsLinkButton>
            <OpsLinkButton href="/internal/scale/readiness">Readiness gate</OpsLinkButton>
            <OpsLinkButton href="/internal/scale-lab">Scale lab</OpsLinkButton>
          </>
        }
      />
      <ScaleSubnav current="/internal/scale" />

      <div className="fj-ops-grid">
        <OpsMetricCard
          label="Gate status"
          value={gateStatusLabel(readiness.gateStatus)}
          completeness="complete"
          meta={readiness.calculationVersion}
        />
        <OpsMetricCard
          label="Current stage"
          value={`Stage ${stage.stage}: ${stage.name}`}
          completeness="complete"
          meta={stage.status}
        />
        <OpsMetricCard
          label="Phase 18"
          value={readiness.phase18Label}
          completeness="complete"
          meta="Production readiness"
        />
        <OpsMetricCard
          label="Phase 19 stabilization"
          value={readiness.phase19StabilizationActive ? "Active" : "Inactive"}
          completeness="complete"
          meta="Required before Stage 1"
        />
      </div>

      <OpsPanel title="Authorization">
        <div className="fj-ops-stack">
          <p className="fj-ops-empty">{readiness.authorizationSummary}</p>
          <p className="fj-ops-empty">
            <OpsStatus
              state={
                readiness.gateStatus === "not_eligible" ? "major_outage" : "degraded"
              }
            />{" "}
            Keep existing acquisition pace. Do not increase paid, affiliate, partner,
            referral, or high-volume organic traffic.
          </p>
          <ul>
            {readiness.blockers.slice(0, 6).map((b) => (
              <li key={b.id}>
                <strong>{b.id}</strong>: {b.title}{" "}
                <Link href={b.link.startsWith("/") ? b.link : "/internal/readiness"}>
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </OpsPanel>
    </>
  );
}
