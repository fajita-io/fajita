"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { CopyField } from "@/components/affiliate/copy-field";
import { APPROVED_DESTINATIONS } from "@/lib/affiliates/destinations";
import {
  createCampaignAction,
  createCodeAction,
  createLinkAction,
} from "@/lib/affiliates/actions/links";

export interface CodeItem {
  id: string;
  code: string;
  isDefault: boolean;
}
export interface CampaignItem {
  id: string;
  name: string;
  slug: string;
}
export interface LinkItem {
  id: string;
  url: string;
  code: string;
  destination: string;
  campaignSlug: string | null;
}

export function LinkManager({
  codes,
  campaigns,
  links,
  canManage,
}: {
  codes: CodeItem[];
  campaigns: CampaignItem[];
  links: LinkItem[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.ok) router.refresh();
      else setError(result.error ?? "That did not work. Try again.");
    });
  };

  return (
    <div style={{ display: "grid", gap: "var(--space-8)" }}>
      {error ? (
        <div className="fj-form-status fj-form-status--error" role="alert">
          {error}
        </div>
      ) : null}

      <section>
        <h2 className="fj-heading-3">Your links</h2>
        {links.length === 0 ? (
          <p className="fj-body-sm">
            No links yet. Build one below and share it anywhere.
          </p>
        ) : (
          <ul className="fj-affiliate__linklist">
            {links.map((link) => (
              <li key={link.id} className="fj-affiliate__linkrow">
                <div className="fj-affiliate__linkmeta">
                  <span className="fj-affiliate__linkcode">{link.code}</span>
                  <span className="fj-affiliate__linkdest">
                    {link.destination}
                    {link.campaignSlug ? ` · ${link.campaignSlug}` : ""}
                  </span>
                </div>
                <CopyField value={link.url} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {canManage ? (
        <>
          <BuildLinkForm
            codes={codes}
            campaigns={campaigns}
            pending={pending}
            onCreate={(input) => run(() => createLinkAction(input))}
          />
          <CreateCampaignForm
            pending={pending}
            onCreate={(input) => run(() => createCampaignAction(input))}
          />
          <CreateCodeForm
            pending={pending}
            onCreate={(code) => run(() => createCodeAction(code))}
          />
        </>
      ) : (
        <p className="fj-body-sm">
          Your account is read only right now, so new links are paused.
        </p>
      )}
    </div>
  );
}

function BuildLinkForm({
  codes,
  campaigns,
  pending,
  onCreate,
}: {
  codes: CodeItem[];
  campaigns: CampaignItem[];
  pending: boolean;
  onCreate: (input: {
    codeId: string;
    destination?: string;
    campaignId?: string;
  }) => void;
}) {
  return (
    <form
      className="fj-affiliate__form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        onCreate({
          codeId: String(data.get("codeId")),
          destination: String(data.get("destination")) || undefined,
          campaignId: String(data.get("campaignId")) || undefined,
        });
      }}
    >
      <h2 className="fj-heading-3">Build a link</h2>
      <div className="fj-field">
        <label htmlFor="link-code">Code</label>
        <select id="link-code" name="codeId" className="fj-input" required>
          {codes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}
              {c.isDefault ? " (default)" : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="fj-field">
        <label htmlFor="link-dest">Destination</label>
        <select id="link-dest" name="destination" className="fj-input" defaultValue="/">
          {APPROVED_DESTINATIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      {campaigns.length > 0 ? (
        <div className="fj-field">
          <label htmlFor="link-campaign">Campaign (optional)</label>
          <select id="link-campaign" name="campaignId" className="fj-input" defaultValue="">
            <option value="">None</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <BrandButton type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Create link"}
      </BrandButton>
    </form>
  );
}

function CreateCampaignForm({
  pending,
  onCreate,
}: {
  pending: boolean;
  onCreate: (input: { name: string; destination?: string }) => void;
}) {
  return (
    <form
      className="fj-affiliate__form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        onCreate({
          name: String(data.get("name")).trim(),
          destination: String(data.get("destination")) || undefined,
        });
        e.currentTarget.reset();
      }}
    >
      <h2 className="fj-heading-3">New campaign</h2>
      <p className="fj-body-sm" style={{ marginTop: 0 }}>
        Group links for one place you post, like a newsletter or a video.
      </p>
      <div className="fj-field">
        <label htmlFor="campaign-name">Name</label>
        <input
          id="campaign-name"
          name="name"
          className="fj-input"
          type="text"
          required
          maxLength={80}
          placeholder="March newsletter"
        />
      </div>
      <div className="fj-field">
        <label htmlFor="campaign-dest">Destination</label>
        <select id="campaign-dest" name="destination" className="fj-input" defaultValue="/">
          {APPROVED_DESTINATIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <BrandButton type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Saving…" : "Create campaign"}
      </BrandButton>
    </form>
  );
}

function CreateCodeForm({
  pending,
  onCreate,
}: {
  pending: boolean;
  onCreate: (code: string) => void;
}) {
  return (
    <form
      className="fj-affiliate__form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        onCreate(String(data.get("code")).trim());
        e.currentTarget.reset();
      }}
    >
      <h2 className="fj-heading-3">New code</h2>
      <p className="fj-body-sm" style={{ marginTop: 0 }}>
        A custom code for a specific audience. Letters, numbers, and hyphens.
      </p>
      <div className="fj-field">
        <label htmlFor="new-code">Code</label>
        <input
          id="new-code"
          name="code"
          className="fj-input"
          type="text"
          required
          minLength={3}
          maxLength={32}
          placeholder="your-code"
        />
      </div>
      <BrandButton type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Saving…" : "Create code"}
      </BrandButton>
    </form>
  );
}
