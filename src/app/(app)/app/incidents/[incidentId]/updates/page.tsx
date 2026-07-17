import { notFound } from "next/navigation";

import { AppSection } from "@/components/app/ui";
import { BrandIcon } from "@/components/design-system/icons";
import { IncidentUpdateComposer } from "@/components/app/incidents/incident-update-composer";
import { requireIncidentPage } from "@/lib/app/incident-page";
import {
  getIncidentDetail,
  listIncidentNotes,
  listIncidentUpdates,
} from "@/lib/incidents/queries";
import { UPDATE_TYPE_LABEL } from "@/lib/incidents/copy";
import { formatTimestamp, relativeTime } from "@/lib/incidents/duration";

export default async function IncidentUpdatesPage({
  params,
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const ctx = await requireIncidentPage("incidents");
  const incident = await getIncidentDetail(ctx.organizationId, incidentId);
  if (!incident) notFound();

  const [updates, notes] = await Promise.all([
    listIncidentUpdates(ctx.organizationId, incidentId),
    listIncidentNotes(ctx.organizationId, incidentId),
  ]);

  return (
    <div className="fj-inc-updates">
      {ctx.canManageIncidents ? (
        <AppSection title="Add an update or note">
          <IncidentUpdateComposer organizationId={ctx.organizationId} incidentId={incidentId} />
        </AppSection>
      ) : null}

      <AppSection title="Updates" description="Internal and public-ready messages. Nothing here is published or delivered yet.">
        {updates.length === 0 ? (
          <p className="fj-inc-empty-line">No updates yet.</p>
        ) : (
          <ul className="fj-inc-updates-list" role="list">
            {updates.map((u) => (
              <li key={u.id} className="fj-inc-update">
                <div className="fj-inc-update__head">
                  <span className="fj-update-type">
                    {UPDATE_TYPE_LABEL[u.updateType as keyof typeof UPDATE_TYPE_LABEL] ?? u.updateType}
                  </span>
                  {u.visibility === "public_ready" ? (
                    <span className="fj-vis-chip fj-vis-chip--public">
                      <BrandIcon name="status-page" size={12} /> Public-ready
                    </span>
                  ) : (
                    <span className="fj-vis-chip">
                      <BrandIcon name="shield" size={12} /> Internal
                    </span>
                  )}
                  {u.supersededAt ? <span className="fj-tag-pill">Superseded</span> : null}
                </div>
                <p className="fj-inc-update__body">{u.body}</p>
                <div className="fj-inc-update__meta">
                  {u.authorName ? `${u.authorName} · ` : ""}
                  <time dateTime={u.createdAt} title={formatTimestamp(u.createdAt, ctx.timezone)}>
                    {relativeTime(u.createdAt)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AppSection>

      <AppSection title="Internal notes" description="Private to your team. Never shown publicly.">
        {notes.length === 0 ? (
          <p className="fj-inc-empty-line">No internal notes.</p>
        ) : (
          <ul className="fj-inc-updates-list" role="list">
            {notes.map((n) => (
              <li key={n.id} className="fj-inc-update fj-inc-update--note">
                <p className="fj-inc-update__body">{n.body}</p>
                <div className="fj-inc-update__meta">
                  {n.authorName ? `${n.authorName} · ` : ""}
                  <time dateTime={n.createdAt} title={formatTimestamp(n.createdAt, ctx.timezone)}>
                    {relativeTime(n.createdAt)}
                  </time>
                  {n.editedAt ? " · edited" : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </AppSection>
    </div>
  );
}
