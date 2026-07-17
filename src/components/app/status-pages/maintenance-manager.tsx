"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import {
  publishMaintenanceAction,
  unpublishMaintenanceAction,
} from "@/lib/app/actions/status-pages";
import { formatInstant } from "@/lib/status-pages/format";
import type { PublishableMaintenance } from "@/lib/status-pages/publication";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  active: "In progress",
  completed: "Completed",
  canceled: "Canceled",
};

export function MaintenanceManager({
  organizationId,
  statusPageId,
  windows,
  timezone,
  locale,
  canPublish,
}: {
  organizationId: string;
  statusPageId: string;
  windows: PublishableMaintenance[];
  timezone: string;
  locale: string;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  function publish(id: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await publishMaintenanceAction(organizationId, statusPageId, id);
      if (!result.ok) setMessage({ tone: "error", text: result.error });
      else {
        setMessage({ tone: "success", text: "Maintenance published." });
        router.refresh();
      }
    });
  }

  function unpublish(id: string) {
    startTransition(async () => {
      const result = await unpublishMaintenanceAction(organizationId, statusPageId, id);
      if (!result.ok) setMessage({ tone: "error", text: result.error });
      else router.refresh();
    });
  }

  return (
    <section className="fj-app-section">
      <div className="fj-app-section__head">
        <h2 className="fj-app-section__title">Scheduled maintenance</h2>
        <p className="fj-app-section__desc">
          Publish a maintenance window to show it on your status page. Times display in {timezone}.
        </p>
      </div>
      <div className="fj-app-section__body">
        {message ? (
          <div className="fj-sp-alert" data-tone={message.tone} role="status" style={{ marginBottom: "var(--space-3)" }}>
            {message.text}
          </div>
        ) : null}

        {windows.length === 0 ? (
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
            No maintenance windows yet. Schedule one from the Maintenance area first.
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--space-3)" }}>
            {windows.map((w) => {
              const isPublished = w.attached && w.publicationState === "published";
              return (
                <li key={w.maintenanceWindowId} className="fj-sp-incident">
                  <div className="fj-sp-incident__row">
                    <div>
                      <div className="fj-sp-incident__title">{w.name}</div>
                      <div className="fj-sp-incident__meta">
                        <span>{STATUS_LABEL[w.status] ?? w.status}</span>
                        <span>
                          {formatInstant(w.startsAt, timezone, locale)}
                          {w.endsAt ? ` to ${formatInstant(w.endsAt, timezone, locale)}` : ""}
                        </span>
                        {isPublished ? <span className="fj-sp-badge" data-tone="ok">Published</span> : null}
                      </div>
                    </div>
                    {canPublish ? (
                      <div className="fj-sp-incident__actions">
                        {isPublished ? (
                          <BrandButton type="button" variant="secondary" onClick={() => unpublish(w.maintenanceWindowId)} disabled={pending}>
                            Unpublish
                          </BrandButton>
                        ) : (
                          <BrandButton type="button" onClick={() => publish(w.maintenanceWindowId)} disabled={pending}>
                            Publish
                          </BrandButton>
                        )}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
