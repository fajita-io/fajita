import { notFound } from "next/navigation";

import { AppSection } from "@/components/app/ui";
import { BrandIcon } from "@/components/design-system/icons";
import { requireIncidentPage } from "@/lib/app/incident-page";
import { getIncidentDetail, listIncidentEvents } from "@/lib/incidents/queries";
import { eventTitle } from "@/lib/incidents/copy";
import { formatTimestamp, relativeTime } from "@/lib/incidents/duration";

export default async function IncidentTimelinePage({
  params,
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const ctx = await requireIncidentPage("incidents");
  const incident = await getIncidentDetail(ctx.organizationId, incidentId);
  if (!incident) notFound();

  const events = await listIncidentEvents(ctx.organizationId, incidentId, { limit: 200 });

  return (
    <AppSection
      title="Timeline"
      description="Every state change and operator action, newest first. Timeline history is not rewritten: corrections are added as new events."
    >
      {events.length === 0 ? (
        <p className="fj-inc-empty-line">No timeline events yet.</p>
      ) : (
        <ol className="fj-inc-timeline" role="list">
          {events.map((e) => (
            <li key={e.id} className="fj-inc-tl-item">
              <div className="fj-inc-tl-item__dot" data-kind={e.actorKind} aria-hidden />
              <div className="fj-inc-tl-item__body">
                <div className="fj-inc-tl-item__head">
                  <span className="fj-inc-tl-item__title">{eventTitle(e.eventType, e.title)}</span>
                  {e.visibility === "public_ready" ? (
                    <span className="fj-vis-chip fj-vis-chip--public">Public-ready</span>
                  ) : e.visibility === "internal" ? (
                    <span className="fj-vis-chip">Internal</span>
                  ) : null}
                </div>
                {e.description ? <p className="fj-inc-tl-item__desc">{e.description}</p> : null}
                <div className="fj-inc-tl-item__meta">
                  <span>
                    {e.actorKind === "system"
                      ? "Fajita"
                      : e.actorKind === "service"
                        ? "Automated"
                        : (e.actorName ?? "Operator")}
                  </span>
                  {e.region ? (
                    <span>
                      <BrandIcon name="region" size={12} /> {e.region}
                    </span>
                  ) : null}
                  <time dateTime={e.occurredAt} title={formatTimestamp(e.occurredAt, ctx.timezone)}>
                    {relativeTime(e.occurredAt)}
                  </time>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </AppSection>
  );
}
