"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { updateSeoAction } from "@/lib/app/actions/status-pages";
import type { StatusPageRecord } from "@/lib/status-pages/status-pages";

export function SeoEditor({
  organizationId,
  statusPageId,
  page,
  canManage,
}: {
  organizationId: string;
  statusPageId: string;
  page: StatusPageRecord;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [indexing, setIndexing] = useState(page.searchIndexingEnabled);
  const [archive, setArchive] = useState(page.indexIncidentArchive);
  const [individual, setIndividual] = useState(page.indexIndividualIncidents);

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await updateSeoAction(organizationId, statusPageId, {
        searchIndexingEnabled: indexing,
        indexIncidentArchive: archive,
        indexIndividualIncidents: individual,
      });
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: "Search settings saved. Republish to apply." });
      router.refresh();
    });
  }

  return (
    <div className="fj-sp-form">
      {message ? (
        <div className="fj-sp-alert" data-tone={message.tone} role="status">
          {message.text}
        </div>
      ) : null}

      <label className="fj-sp-toggle-row">
        <span>
          <span className="fj-sp-toggle-row__label">Index this status page</span>
          <div className="fj-sp-toggle-row__hint">Let search engines list your public status page.</div>
        </span>
        <input type="checkbox" checked={indexing} onChange={(e) => setIndexing(e.target.checked)} disabled={!canManage} />
      </label>
      <label className="fj-sp-toggle-row">
        <span>
          <span className="fj-sp-toggle-row__label">Index the incident archive</span>
          <div className="fj-sp-toggle-row__hint">Allow the incident history page to be indexed.</div>
        </span>
        <input type="checkbox" checked={archive} onChange={(e) => setArchive(e.target.checked)} disabled={!canManage || !indexing} />
      </label>
      <label className="fj-sp-toggle-row">
        <span>
          <span className="fj-sp-toggle-row__label">Index individual incidents</span>
          <div className="fj-sp-toggle-row__hint">Off by default. Individual incident pages stay noindex unless enabled.</div>
        </span>
        <input type="checkbox" checked={individual} onChange={(e) => setIndividual(e.target.checked)} disabled={!canManage || !indexing} />
      </label>

      {canManage ? (
        <div className="fj-sp-actions">
          <BrandButton type="button" onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save search settings"}
          </BrandButton>
        </div>
      ) : null}
    </div>
  );
}
