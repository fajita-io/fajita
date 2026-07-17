import Link from "next/link";

import { BrandIcon } from "@/components/design-system/icons";
import {
  FlappingChip,
  LifecycleChip,
  OperationalBadge,
  OriginChip,
  SeverityBadge,
} from "@/components/app/incidents/incident-bits";
import { incidentDuration, relativeTime } from "@/lib/incidents/duration";
import type { IncidentListItem } from "@/lib/incidents/queries";

/**
 * Incident list. Editorial rows rather than a dense enterprise table: state and
 * severity lead, supporting metadata follows. Each row is one link to the
 * incident. Time is shown relatively with the exact instant on hover/title.
 */
export function IncidentsList({ items }: { items: IncidentListItem[] }) {
  return (
    <ul className="fj-inc-list" role="list">
      {items.map((inc) => {
        const active = inc.lifecycleStatus === "open" || inc.lifecycleStatus === "monitoring";
        return (
          <li key={inc.id} className="fj-inc-row">
            <Link href={`/app/incidents/${inc.id}`} className="fj-inc-row__link">
              <div className="fj-inc-row__lead">
                <OperationalBadge state={inc.operationalStatus} />
                <SeverityBadge severity={inc.severity} />
              </div>
              <div className="fj-inc-row__main">
                <div className="fj-inc-row__title">
                  {inc.referenceCode ? (
                    <span className="fj-inc-row__ref">{inc.referenceCode}</span>
                  ) : null}
                  {inc.title}
                </div>
                <div className="fj-inc-row__meta">
                  <LifecycleChip status={inc.lifecycleStatus} />
                  <OriginChip origin={inc.origin} />
                  {inc.affectedMonitorCount > 0 ? (
                    <span>
                      <BrandIcon name="monitor-http" size={13} />{" "}
                      {inc.affectedMonitorCount}{" "}
                      {inc.affectedMonitorCount === 1 ? "monitor" : "monitors"}
                    </span>
                  ) : null}
                  {inc.isFlapping ? <FlappingChip /> : null}
                  {inc.activeMaintenanceOccurrenceId ? (
                    <span>
                      <BrandIcon name="maintenance" size={13} /> Maintenance
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="fj-inc-row__side">
                <span
                  className="fj-inc-row__time"
                  title={active ? `Opened ${inc.openedAt}` : `Resolved ${inc.resolvedAt ?? ""}`}
                >
                  {active ? (
                    <>Open for {incidentDuration(inc.openedAt, null)}</>
                  ) : (
                    <>{incidentDuration(inc.openedAt, inc.resolvedAt)} total</>
                  )}
                </span>
                <span className="fj-inc-row__ack">
                  {inc.acknowledgedAt ? (
                    <>
                      <BrandIcon name="check" size={13} /> Acknowledged
                    </>
                  ) : active ? (
                    <span className="fj-inc-row__unack">Unacknowledged</span>
                  ) : null}
                </span>
                {inc.assigneeName ? (
                  <span className="fj-inc-row__assignee">
                    <BrandIcon name="team" size={13} /> {inc.assigneeName}
                  </span>
                ) : null}
                <span className="fj-inc-row__updated">Updated {relativeTime(inc.lastTransitionAt)}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
