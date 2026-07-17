"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { rollbackStatusPageAction } from "@/lib/app/actions/status-pages";
import { formatInstant } from "@/lib/status-pages/format";
import type { VersionRecord } from "@/lib/status-pages/versions";

export function VersionsManager({
  organizationId,
  statusPageId,
  versions,
  publishedVersionId,
  timezone,
  locale,
  canPublish,
}: {
  organizationId: string;
  statusPageId: string;
  versions: VersionRecord[];
  publishedVersionId: string | null;
  timezone: string;
  locale: string;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  function rollback(versionId: string, versionNumber: number) {
    if (!confirm(`Roll back to version ${versionNumber}? This creates a new published version from the old one.`)) return;
    setMessage(null);
    startTransition(async () => {
      const result = await rollbackStatusPageAction(organizationId, statusPageId, versionId);
      if (!result.ok) setMessage({ tone: "error", text: result.error });
      else {
        setMessage({ tone: "success", text: "Rolled back. A new version is now live." });
        router.refresh();
      }
    });
  }

  return (
    <section className="fj-app-section">
      <div className="fj-app-section__head">
        <h2 className="fj-app-section__title">Published versions</h2>
        <p className="fj-app-section__desc">
          Every publish is saved as an immutable version. Rolling back publishes a fresh copy of an earlier one.
        </p>
      </div>
      <div className="fj-app-section__body">
        {message ? (
          <div className="fj-sp-alert" data-tone={message.tone} role="status" style={{ marginBottom: "var(--space-3)" }}>
            {message.text}
          </div>
        ) : null}

        {versions.length === 0 ? (
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>No versions yet. Publish the page to create the first one.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--space-2)" }}>
            {versions.map((v) => {
              const isLive = v.id === publishedVersionId;
              return (
                <li key={v.id} className="fj-sp-incident">
                  <div className="fj-sp-incident__row">
                    <div>
                      <div className="fj-sp-incident__title">
                        Version {v.versionNumber}
                        {isLive ? <span className="fj-sp-badge" data-tone="ok" style={{ marginLeft: 8 }}>Live</span> : null}
                      </div>
                      <div className="fj-sp-incident__meta">
                        <span>{formatInstant(v.createdAt, timezone, locale)}</span>
                        {v.createdByName ? <span>by {v.createdByName}</span> : null}
                      </div>
                    </div>
                    {canPublish && !isLive ? (
                      <div className="fj-sp-incident__actions">
                        <BrandButton type="button" variant="secondary" onClick={() => rollback(v.id, v.versionNumber)} disabled={pending}>
                          Roll back to this
                        </BrandButton>
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
