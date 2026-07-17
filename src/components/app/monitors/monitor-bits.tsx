import { StatusBadge } from "@/components/design-system/status/status-badge";
import { BrandIcon } from "@/components/design-system/icons";
import type { TagView } from "@/lib/monitoring/queries";
import { lifecycleLabel, resultToStatus } from "@/lib/monitoring/status-map";
import { typeIcon, typeLabel } from "@/lib/monitoring/display";

/**
 * Small presentational pieces shared across monitor surfaces. Server-safe (no
 * client hooks). Latest check result and monitor lifecycle status are always
 * shown as separate signals: a single failed check is never presented as a
 * "Down" monitor, and status is never encoded by color alone.
 */

export function ResultBadge({
  result,
  size,
}: {
  result: string | null;
  size?: "sm";
}) {
  const mapped = resultToStatus(result);
  return (
    <StatusBadge
      status={mapped.status}
      label={mapped.label}
      className={size === "sm" ? "fj-status-badge--sm" : undefined}
    />
  );
}

export function LifecyclePill({ status }: { status: string }) {
  return (
    <span className="fj-mon-life" data-life={status}>
      {lifecycleLabel(status)}
    </span>
  );
}

export function TagChips({ tags }: { tags: TagView[] }) {
  if (tags.length === 0) return null;
  return (
    <span className="fj-taglist">
      {tags.map((t) => (
        <span key={t.id} className="fj-tag" data-color={t.colorToken}>
          {t.name}
        </span>
      ))}
    </span>
  );
}

export function TypeGlyph({ monitorType }: { monitorType: string }) {
  return (
    <span className="fj-mon-row__type" aria-hidden="true">
      <BrandIcon name={typeIcon(monitorType)} size={18} />
    </span>
  );
}

export function TypeGlyphLabel({ monitorType }: { monitorType: string }) {
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}
    >
      <BrandIcon name={typeIcon(monitorType)} size={16} label={typeLabel(monitorType)} />
      {typeLabel(monitorType)}
    </span>
  );
}
