import { BrandIcon } from "@/components/design-system/icons";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import {
  ORIGIN_LABEL,
  SEVERITY_ICON,
  lifecycleLabel,
  operationalToStatus,
} from "@/lib/incidents/display";
import { SEVERITY_LABEL } from "@/lib/incidents/copy";
import type { IncidentOrigin, OperationalState, Severity } from "@/lib/incidents/constants";

/** Severity pill. Icon + word, never color only. */
export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`fj-sev fj-sev--${severity}`}>
      <BrandIcon name={SEVERITY_ICON[severity]} size={13} />
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

/** Operational state, reusing the monitor status badge language. */
export function OperationalBadge({ state }: { state: OperationalState }) {
  return <StatusBadge status={operationalToStatus(state)} />;
}

/** Lifecycle chip (Open, Monitoring, Resolved, Canceled). */
export function LifecycleChip({ status }: { status: string }) {
  return <span className={`fj-lifecycle fj-lifecycle--${status}`}>{lifecycleLabel(status)}</span>;
}

export function OriginChip({ origin }: { origin: IncidentOrigin }) {
  return <span className="fj-origin-chip">{ORIGIN_LABEL[origin]}</span>;
}

export function FlappingChip() {
  return (
    <span className="fj-flap-chip" title="This monitor is switching between pass and fail repeatedly.">
      <BrandIcon name="warning" size={12} /> Flapping
    </span>
  );
}
