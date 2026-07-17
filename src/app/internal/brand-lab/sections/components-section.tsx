import {
  BrandButton,
  BrandCard,
  ChannelChip,
  CodeBlock,
  DemoFrame,
  IntegrationTile,
  Metric,
  ThermalDivider,
  Tooltip,
} from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { StatusBadge, StatusDot } from "@/components/design-system/status/status-badge";
import { UptimeChart, sampleUptimeDays } from "@/components/design-system/uptime-chart";
import { statusSpecs, type OperationalStatus } from "@/components/design-system/status/status";

import { LabGrid, LabSection, LabSpecimen } from "./lab-ui";

const statuses = Object.keys(statusSpecs) as OperationalStatus[];

export function StatusSection() {
  return (
    <LabSection
      id="status"
      title="Status treatments"
      note="Badge = icon + label + tinted surface. Dot = dense lists only, always beside a visible label. The uptime strip carries a hidden per-day text alternative, so it reads without color. States transition with the thermal easing: temperature never teleports."
    >
      <h3 className="fj-heading-3" style={{ marginBottom: "var(--space-4)" }}>Badges</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
        {statuses.map((s) => <StatusBadge key={s} status={s} />)}
      </div>

      <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>
        Monitor list rows
      </h3>
      <BrandCard style={{ padding: 0, overflow: "hidden" }}>
        {(
          [
            ["acme.dev", "operational", "182ms"],
            ["api.acme.dev", "degraded", "941ms"],
            ["checkout.acme.dev", "down", "timeout"],
            ["cron: nightly-backup", "paused", "paused 2d ago"],
          ] as Array<[string, OperationalStatus, string]>
        ).map(([name, status, meta], i) => (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-4) var(--space-5)",
              borderTop: i ? "1px solid var(--color-border-subtle)" : undefined,
            }}
          >
            <StatusDot status={status} live={status === "down"} />
            <span className="fj-mono" style={{ flex: 1 }}>{name}</span>
            <span className="fj-caption fj-numeric">{meta}</span>
            <StatusBadge status={status} />
          </div>
        ))}
      </BrandCard>

      <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>
        Uptime history (90 days, deterministic sample)
      </h3>
      <UptimeChart days={sampleUptimeDays()} label="api.acme.dev · last 90 days" />
    </LabSection>
  );
}

export function ComponentsSection() {
  return (
    <LabSection
      id="components"
      title="Component library"
      note="Foundational primitives only: enough to keep later phases consistent without over-designing app workflows that do not exist yet."
    >
      <h3 className="fj-heading-3" style={{ marginBottom: "var(--space-4)" }}>Buttons</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center" }}>
        <BrandButton>Start monitoring</BrandButton>
        <BrandButton variant="secondary">See it work</BrandButton>
        <BrandButton variant="ghost">View docs</BrandButton>
        <BrandButton size="sm">Publish update</BrandButton>
        <BrandButton disabled>Start monitoring</BrandButton>
        <Tooltip content="Checks run every 30 seconds">
          <BrandButton variant="secondary" size="sm">Hover or focus me</BrandButton>
        </Tooltip>
      </div>

      <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>Metrics</h3>
      <LabGrid min="11rem">
        <Metric value="99.982%" label="Uptime, 90 days" />
        <Metric value="184ms" label="Response time, p50" />
        <Metric value="41s" label="Median time to alert" />
        <Metric value="12" label="Monitors watching" />
      </LabGrid>

      <ThermalDivider />

      <h3 className="fj-heading-3" style={{ margin: "0 0 var(--space-4)" }}>
        Cards and demo frame
      </h3>
      <LabGrid min="20rem">
        <BrandCard>
          <p className="fj-heading-3" style={{ margin: 0 }}>Standard card</p>
          <p className="fj-body-sm" style={{ marginTop: "var(--space-2)" }}>
            Elevated surface for product content. Warm shadow, subtle border.
          </p>
        </BrandCard>
        <BrandCard variant="editorial">
          <p className="fj-eyebrow" style={{ marginBottom: "var(--space-2)" }}>Editorial card</p>
          <p className="fj-heading-3" style={{ margin: 0 }}>
            Certificates expire on weekends.
          </p>
          <p className="fj-body-sm" style={{ marginTop: "var(--space-2)" }}>
            Marketing surfaces get the larger radius and quieter background.
          </p>
        </BrandCard>
      </LabGrid>

      <div style={{ marginTop: "var(--space-6)" }}>
        <DemoFrame title="app.fajita.io/monitors">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <StatusBadge status="operational" label="All systems operational" />
            <span className="fj-caption">12 monitors · 4 regions · checked 28s ago</span>
          </div>
          <div style={{ marginTop: "var(--space-4)" }}>
            <UptimeChart days={sampleUptimeDays(90, 3)} label="acme.dev · last 90 days" />
          </div>
        </DemoFrame>
      </div>

      <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>
        Chips, tiles, code
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
        <ChannelChip icon={<BrandIcon name="alert" size={14} />}>#ops on Slack</ChannelChip>
        <ChannelChip icon={<BrandIcon name="subscriber" size={14} />}>oncall@acme.dev</ChannelChip>
        <ChannelChip icon={<BrandIcon name="webhook" size={14} />}>PagerDuty webhook</ChannelChip>
      </div>
      <LabGrid min="12rem" style={{ marginBottom: "var(--space-4)" }}>
        <IntegrationTile name="Slack" icon={<BrandIcon name="alert" size={20} />} />
        <IntegrationTile name="Webhooks" icon={<BrandIcon name="webhook" size={20} />} />
        <IntegrationTile name="Email" icon={<BrandIcon name="subscriber" size={20} />} />
        <IntegrationTile name="Status pages" icon={<BrandIcon name="status-page" size={20} />} />
      </LabGrid>
      <CodeBlock label="Example monitor check">
        {`GET https://api.acme.dev/health
→ 200 OK in 184ms from us-east
→ 201ms from eu-central · 224ms from ap-southeast
ssl: valid until 2026-11-02 (109 days)`}
      </CodeBlock>

      <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>
        Pattern background (rate-limited to one per page)
      </h3>
      <LabSpecimen label=".fj-heat-grid">
        <div
          className="fj-heat-grid"
          style={{ width: "100%", height: "6rem", borderRadius: "var(--radius-md)" }}
        />
      </LabSpecimen>
    </LabSection>
  );
}
