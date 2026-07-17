"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { submitApplicationAction } from "@/lib/affiliates/actions/apply";

const PROMOTION_METHODS = [
  "Blog or website",
  "Newsletter",
  "YouTube or video",
  "Social media",
  "Community or forum",
  "Course or workshop",
  "Consulting or agency",
  "Word of mouth",
];

const AUDIENCE_BANDS = [
  "Under 1,000",
  "1,000 to 10,000",
  "10,000 to 100,000",
  "Over 100,000",
];

/**
 * Affiliate application form. Identity comes from the session, not this form;
 * the email field is contact preference only. Honest states: it never claims
 * approval, only that the application was received.
 */
export function AffiliateApplyForm({
  defaultEmail,
  defaultWebsite,
}: {
  defaultEmail: string;
  defaultWebsite?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "failed"; detail: string }
  >({ kind: "idle" });
  const [methods, setMethods] = useState<string[]>([]);

  const toggleMethod = (method: string) => {
    setMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method],
    );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus({ kind: "sending" });

    const result = await submitApplicationAction({
      email: String(data.get("email") ?? "").trim(),
      country: String(data.get("country") ?? "").trim(),
      websiteUrl: String(data.get("websiteUrl") ?? "").trim() || undefined,
      promotionMethods: methods,
      audienceSizeBand: String(data.get("audienceSizeBand") ?? "") || undefined,
      relevance: String(data.get("relevance") ?? "").trim() || undefined,
      disclosureMethod: String(data.get("disclosureMethod") ?? "").trim() || undefined,
      usesPaidSearch: data.get("usesPaidSearch") === "on",
      usesEmailMarketing: data.get("usesEmailMarketing") === "on",
      isExistingCustomer: data.get("isExistingCustomer") === "on",
      acceptTerms: data.get("acceptTerms") === "on" ? true : (false as never),
    });

    if (result.ok) {
      setStatus({ kind: "sent" });
      router.refresh();
    } else {
      setStatus({ kind: "failed", detail: result.error });
    }
  };

  if (status.kind === "sent") {
    return (
      <div className="fj-form-status fj-form-status--success" role="status">
        <strong>Your application is in.</strong> We review each one by hand and
        will reach you by email. You do not have a referral link yet. Nothing is
        approved until you hear from us.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate style={{ display: "grid", gap: "var(--space-6)" }}>
      <div className="fj-field">
        <label htmlFor="aff-email">Contact email</label>
        <input
          id="aff-email"
          name="email"
          className="fj-input"
          type="email"
          autoComplete="email"
          required
          defaultValue={defaultEmail}
        />
      </div>

      <div className="fj-field">
        <label htmlFor="aff-country">Country</label>
        <input
          id="aff-country"
          name="country"
          className="fj-input"
          type="text"
          autoComplete="country-name"
          required
          placeholder="United States"
        />
      </div>

      <div className="fj-field">
        <label htmlFor="aff-website">Main website or channel</label>
        <input
          id="aff-website"
          name="websiteUrl"
          className="fj-input"
          type="url"
          inputMode="url"
          placeholder="https://"
          defaultValue={defaultWebsite ?? ""}
        />
      </div>

      <fieldset className="fj-field" style={{ border: 0, margin: 0, padding: 0 }}>
        <legend style={{ marginBottom: "var(--space-2)" }}>
          How do you reach people?
        </legend>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-2)",
          }}
        >
          {PROMOTION_METHODS.map((method) => (
            <label key={method} className="fj-checkbox">
              <input
                type="checkbox"
                checked={methods.includes(method)}
                onChange={() => toggleMethod(method)}
              />
              <span>{method}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="fj-field">
        <label htmlFor="aff-audience">Audience size</label>
        <select
          id="aff-audience"
          name="audienceSizeBand"
          className="fj-input"
          defaultValue=""
        >
          <option value="" disabled>
            Choose one
          </option>
          {AUDIENCE_BANDS.map((band) => (
            <option key={band} value={band}>
              {band}
            </option>
          ))}
        </select>
      </div>

      <div className="fj-field">
        <label htmlFor="aff-relevance">
          Why is Fajita a fit for your audience?
        </label>
        <textarea
          id="aff-relevance"
          name="relevance"
          className="fj-input"
          rows={4}
          placeholder="Tell us who you reach and why uptime monitoring matters to them."
        />
      </div>

      <div className="fj-field">
        <label htmlFor="aff-disclosure">
          How will you disclose affiliate links?
        </label>
        <input
          id="aff-disclosure"
          name="disclosureMethod"
          className="fj-input"
          type="text"
          placeholder="e.g. a clear note on each post"
        />
      </div>

      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        <label className="fj-checkbox">
          <input type="checkbox" name="usesPaidSearch" />
          <span>I may promote Fajita through paid search ads.</span>
        </label>
        <label className="fj-checkbox">
          <input type="checkbox" name="usesEmailMarketing" />
          <span>I may promote Fajita by email.</span>
        </label>
        <label className="fj-checkbox">
          <input type="checkbox" name="isExistingCustomer" />
          <span>I already use Fajita.</span>
        </label>
      </div>

      <label className="fj-checkbox">
        <input type="checkbox" name="acceptTerms" required />
        <span>
          I have read and accept the{" "}
          <Link href="/legal/affiliate-agreement" target="_blank" rel="noopener noreferrer">
            Affiliate Program Agreement
          </Link>{" "}
          and the{" "}
          <Link href="/legal/affiliate-privacy" target="_blank" rel="noopener noreferrer">
            Affiliate Privacy Notice
          </Link>
          . I understand commissions are not guaranteed income.
        </span>
      </label>

      {status.kind === "failed" ? (
        <div className="fj-form-status fj-form-status--error" role="alert">
          {status.detail}
        </div>
      ) : null}

      <div>
        <BrandButton type="submit" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending…" : "Submit application"}
        </BrandButton>
      </div>
    </form>
  );
}
