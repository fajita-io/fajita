"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import {
  publishStatusPageAction,
  unpublishStatusPageAction,
} from "@/lib/app/actions/status-pages";

export function PublishPanel({
  organizationId,
  statusPageId,
  status,
  canPublish,
}: {
  organizationId: string;
  statusPageId: string;
  status: string;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const isLive = status === "published";

  function publish() {
    setMessage(null);
    startTransition(async () => {
      const result = await publishStatusPageAction(organizationId, statusPageId);
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: `Published version ${result.data!.versionNumber}. Your page is live.` });
      router.refresh();
    });
  }

  function unpublish() {
    setMessage(null);
    startTransition(async () => {
      const result = await unpublishStatusPageAction(organizationId, statusPageId);
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: "The page is no longer public." });
      router.refresh();
    });
  }

  if (!canPublish) {
    return (
      <p className="fj-sp-field__hint">
        Publishing requires the publish permission. Ask an admin or owner to make this page live.
      </p>
    );
  }

  return (
    <div>
      {message ? (
        <div className="fj-sp-alert" data-tone={message.tone} role="status">
          {message.text}
        </div>
      ) : null}
      <div className="fj-sp-actions">
        <BrandButton type="button" onClick={publish} disabled={pending}>
          {pending ? "Working…" : isLive ? "Republish changes" : "Publish"}
        </BrandButton>
        {isLive ? (
          <BrandButton type="button" variant="secondary" onClick={unpublish} disabled={pending}>
            Unpublish
          </BrandButton>
        ) : null}
      </div>
    </div>
  );
}
