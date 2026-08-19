"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { useToast } from "@/components/app/toast";
import { PROVIDER_BLURB, PROVIDER_LABEL, ProviderMark } from "@/components/app/alerts/alert-bits";
import {
  createDiscordChannelAction,
  createEmailChannelAction,
  createSlackChannelAction,
  createWebhookChannelAction,
} from "@/lib/app/actions/alerts";
import { ALERT_PROVIDERS, type AlertProvider } from "@/lib/alerts/constants";

interface Recipient {
  email: string;
  label: string;
  isMember: boolean;
}

export function ChannelCreateForm({
  organizationId,
  initialProvider,
  enabledProviders,
}: {
  organizationId: string;
  initialProvider?: AlertProvider;
  enabledProviders: AlertProvider[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();

  const allowed = enabledProviders.length > 0 ? enabledProviders : (["email"] as AlertProvider[]);
  const [provider, setProvider] = useState<AlertProvider | null>(
    initialProvider && allowed.includes(initialProvider) ? initialProvider : null,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Email
  const [recipients, setRecipients] = useState<Recipient[]>([{ email: "", label: "", isMember: false }]);
  // Chat webhooks
  const [webhookUrl, setWebhookUrl] = useState("");
  const [hint, setHint] = useState("");
  // Generic webhook
  const [url, setUrl] = useState("");
  const [signingEnabled, setSigningEnabled] = useState(true);

  // Signing secret revealed once after a webhook channel is created.
  const [reveal, setReveal] = useState<{ channelId: string; secret?: string; keyId?: string } | null>(null);

  function reset() {
    setName("");
    setDescription("");
    setRecipients([{ email: "", label: "", isMember: false }]);
    setWebhookUrl("");
    setHint("");
    setUrl("");
    setSigningEnabled(true);
  }

  function submit() {
    if (!provider) return;
    if (name.trim().length < 1) {
      toast.error("Name this channel so your team knows what it feeds.");
      return;
    }

    start(async () => {
      const base = { name: name.trim(), description: description.trim() || undefined };
      if (provider === "email") {
        const cleaned = recipients
          .map((r) => ({ email: r.email.trim(), label: r.label.trim() || undefined, isMember: r.isMember }))
          .filter((r) => r.email.length > 0);
        if (cleaned.length === 0) {
          toast.error("Add at least one recipient.");
          return;
        }
        const res = await createEmailChannelAction(organizationId, { ...base, recipients: cleaned });
        finish(res);
      } else if (provider === "slack") {
        if (!webhookUrl.trim()) return toast.error("Paste your Slack incoming webhook URL.");
        const res = await createSlackChannelAction(organizationId, {
          ...base,
          webhookUrl: webhookUrl.trim(),
          channelHint: hint.trim() || undefined,
        });
        finish(res);
      } else if (provider === "discord") {
        if (!webhookUrl.trim()) return toast.error("Paste your Discord webhook URL.");
        const res = await createDiscordChannelAction(organizationId, {
          ...base,
          webhookUrl: webhookUrl.trim(),
          serverHint: hint.trim() || undefined,
        });
        finish(res);
      } else {
        if (!url.trim()) return toast.error("Enter the endpoint URL.");
        const res = await createWebhookChannelAction(organizationId, {
          ...base,
          url: url.trim(),
          signingEnabled,
          customHeaders: [],
        });
        if (res.ok && res.data?.signingSecret) {
          setReveal({ channelId: res.data.channelId, secret: res.data.signingSecret, keyId: res.data.signingKeyId });
          toast.success("Webhook channel created.");
          return;
        }
        finish(res);
      }
    });
  }

  function finish(res: { ok: boolean; error?: string; data?: { channelId: string } }) {
    if (res.ok && res.data) {
      toast.success("Channel created. Send a test before you route anything to it.");
      router.push(`/app/integrations/${res.data.channelId}`);
      router.refresh();
    } else {
      toast.error(res.error ?? "That did not work.");
    }
  }

  if (reveal) {
    return (
      <div className="fj-reveal">
        <div className="fj-reveal__head">
          <BrandIcon name="secret-lock" size={18} />
          <h2>Save your signing secret</h2>
        </div>
        <p>
          Use this to verify that every request came from Fajita. We show it once and store only a
          hash. If you lose it, rotate the key from the channel page.
        </p>
        <div className="fj-secret-box">
          <code>{reveal.secret}</code>
        </div>
        {reveal.keyId ? <p className="fj-field__hint">Key ID: {reveal.keyId}</p> : null}
        <div className="fj-inc-composer__actions">
          <BrandButton
            onClick={() => {
              navigator.clipboard?.writeText(reveal.secret ?? "").then(
                () => toast.success("Copied."),
                () => toast.error("Copy failed. Select it manually."),
              );
            }}
            variant="secondary"
          >
            Copy secret
          </BrandButton>
          <BrandButton
            onClick={() => {
              router.push(`/app/integrations/${reveal.channelId}`);
              router.refresh();
            }}
          >
            I saved it, continue
          </BrandButton>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="fj-provider-grid">
        {ALERT_PROVIDERS.map((p) => {
          const enabled = allowed.includes(p);
          return (
            <button
              key={p}
              type="button"
              className="fj-provider-choice"
              disabled={!enabled}
              onClick={() => enabled && setProvider(p)}
            >
              <ProviderMark provider={p} size={20} />
              <span className="fj-provider-choice__name">{PROVIDER_LABEL[p]}</span>
              <span className="fj-provider-choice__blurb">
                {enabled
                  ? PROVIDER_BLURB[p]
                  : p === "email"
                    ? "Email alerts are unavailable on your current plan."
                    : "Slack, Discord, and webhook alerts are on Team and Scale."}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="fj-inc-form">
      <button type="button" className="fj-link-button" onClick={() => { setProvider(null); reset(); }}>
        <BrandIcon name="chevron-right" size={14} className="fj-flip-up" /> Choose a different type
      </button>

      <div className="fj-chosen-provider">
        <ProviderMark provider={provider} />
        <div>
          <strong>{PROVIDER_LABEL[provider]}</strong>
          <p className="fj-field__hint">{PROVIDER_BLURB[provider]}</p>
        </div>
      </div>

      <div className="fj-field">
        <label htmlFor="ch-name">Name</label>
        <input
          id="ch-name"
          className="fj-input"
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
          placeholder={provider === "email" ? "On-call engineers" : provider === "webhook" ? "Ops webhook" : "#incidents"}
        />
      </div>

      <div className="fj-field">
        <label htmlFor="ch-desc">Description (optional)</label>
        <input
          id="ch-desc"
          className="fj-input"
          value={description}
          maxLength={500}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Where does this go and who reads it?"
        />
      </div>

      {provider === "email" ? (
        <div className="fj-field">
          <span className="fj-field__label">Recipients</span>
          <p className="fj-field__hint">Your teammates are verified automatically. External addresses get a confirmation email.</p>
          <div className="fj-recip-list">
            {recipients.map((r, i) => (
              <div key={i} className="fj-recip-row">
                <input
                  className="fj-input"
                  type="email"
                  value={r.email}
                  placeholder="name@company.com"
                  onChange={(e) => setRecipients((prev) => prev.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))}
                />
                <input
                  className="fj-input"
                  value={r.label}
                  placeholder="Label (optional)"
                  maxLength={80}
                  onChange={(e) => setRecipients((prev) => prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                />
                {recipients.length > 1 ? (
                  <button
                    type="button"
                    className="fj-icon-button"
                    aria-label="Remove recipient"
                    onClick={() => setRecipients((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <BrandIcon name="close" size={14} />
                  </button>
                ) : (
                  <span aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="fj-link-button"
            onClick={() => setRecipients((prev) => [...prev, { email: "", label: "", isMember: false }])}
          >
            <BrandIcon name="plus" size={14} /> Add recipient
          </button>
        </div>
      ) : null}

      {provider === "slack" || provider === "discord" ? (
        <>
          <div className="fj-field">
            <label htmlFor="ch-url">{provider === "slack" ? "Slack incoming webhook URL" : "Discord webhook URL"}</label>
            <input
              id="ch-url"
              className="fj-input"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder={provider === "slack" ? "https://hooks.slack.com/services/…" : "https://discord.com/api/webhooks/…"}
            />
            <p className="fj-field__hint">Stored encrypted. We never display it again after you save.</p>
          </div>
          <div className="fj-field">
            <label htmlFor="ch-hint">{provider === "slack" ? "Channel (optional)" : "Server (optional)"}</label>
            <input
              id="ch-hint"
              className="fj-input"
              value={hint}
              maxLength={80}
              onChange={(e) => setHint(e.target.value)}
              placeholder={provider === "slack" ? "#incidents" : "Ops server"}
            />
          </div>
        </>
      ) : null}

      {provider === "webhook" ? (
        <>
          <div className="fj-field">
            <label htmlFor="ch-endpoint">Endpoint URL</label>
            <input
              id="ch-endpoint"
              className="fj-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.yourcompany.com/hooks/fajita"
            />
            <p className="fj-field__hint">Must be HTTPS and public. Private and internal addresses are refused.</p>
          </div>
          <label className="fj-check-chip fj-check-chip--wide">
            <input type="checkbox" checked={signingEnabled} onChange={(e) => setSigningEnabled(e.target.checked)} />
            Sign every request so you can verify it came from Fajita (recommended)
          </label>
        </>
      ) : null}

      <div className="fj-inc-composer__actions">
        <BrandButton disabled={pending} onClick={submit}>
          {pending ? "Creating…" : "Create channel"}
        </BrandButton>
      </div>
    </div>
  );
}
