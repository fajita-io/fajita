"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import {
  requestAccountClosureAction,
  updateEmailPreferencesAction,
  updateProfileAction,
} from "@/lib/affiliates/actions/settings";
import type {
  AffiliateEmailPreferences,
  AffiliateProfileView,
} from "@/lib/affiliates/profile";

function Status({ state }: { state: { ok: boolean; text: string } | null }) {
  if (!state) return null;
  return (
    <p
      className={`fj-form-status${state.ok ? "" : " fj-form-status--error"}`}
      role={state.ok ? "status" : "alert"}
    >
      {state.text}
    </p>
  );
}

export function ProfileForm({
  initial,
  readOnly,
}: {
  initial: AffiliateProfileView;
  readOnly: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [displayName, setDisplayName] = useState(initial.displayName ?? "");
  const [contactEmail, setContactEmail] = useState(initial.contactEmail ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    startTransition(async () => {
      const result = await updateProfileAction({
        displayName,
        contactEmail,
        websiteUrl,
      });
      if (!result.ok) setStatus({ ok: false, text: result.error });
      else {
        setStatus({ ok: true, text: "Saved." });
        router.refresh();
      }
    });
  }

  return (
    <form className="fj-form-stack" onSubmit={submit} noValidate>
      <Status state={status} />
      <div className="fj-field">
        <label htmlFor="aff-name">Display name</label>
        <input
          id="aff-name"
          className="fj-input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={readOnly || pending}
          maxLength={80}
        />
      </div>
      <div className="fj-field">
        <label htmlFor="aff-email">Contact email</label>
        <input
          id="aff-email"
          type="email"
          className="fj-input"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          disabled={readOnly || pending}
          placeholder="Where we send program email"
        />
      </div>
      <div className="fj-field">
        <label htmlFor="aff-web">Website</label>
        <input
          id="aff-web"
          className="fj-input"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          disabled={readOnly || pending}
          placeholder="https://"
        />
      </div>
      {!readOnly ? (
        <div>
          <BrandButton type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save profile"}
          </BrandButton>
        </div>
      ) : (
        <p className="fj-body-sm">
          Your profile is read only while your account is not active.
        </p>
      )}
    </form>
  );
}

const PREF_ITEMS: {
  key: keyof AffiliateEmailPreferences;
  label: string;
  desc: string;
}[] = [
  {
    key: "conversionNotifications",
    label: "Referrals",
    desc: "When someone you referred signs up.",
  },
  {
    key: "commissionNotifications",
    label: "Commissions",
    desc: "When you earn or a commission clears.",
  },
  {
    key: "payoutNotifications",
    label: "Payouts",
    desc: "When we send a payout.",
  },
  {
    key: "programUpdates",
    label: "Program updates",
    desc: "Changes to how the program works.",
  },
  {
    key: "educational",
    label: "Tips",
    desc: "Occasional ideas to earn more.",
  },
];

export function EmailPreferencesForm({
  initial,
  readOnly,
}: {
  initial: AffiliateEmailPreferences;
  readOnly: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [values, setValues] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    startTransition(async () => {
      const result = await updateEmailPreferencesAction(values);
      if (!result.ok) setStatus({ ok: false, text: result.error });
      else {
        setStatus({ ok: true, text: "Saved." });
        router.refresh();
      }
    });
  }

  return (
    <form className="fj-form-stack" onSubmit={submit} noValidate>
      <Status state={status} />
      {PREF_ITEMS.map((item) => (
        <label key={item.key} className="fj-check">
          <input
            type="checkbox"
            checked={values[item.key]}
            onChange={(e) =>
              setValues((v) => ({ ...v, [item.key]: e.target.checked }))
            }
            disabled={readOnly || pending}
          />
          <span>
            <strong>{item.label}.</strong> {item.desc}
          </span>
        </label>
      ))}
      {!readOnly ? (
        <div>
          <BrandButton type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save preferences"}
          </BrandButton>
        </div>
      ) : null}
    </form>
  );
}

export function ClosureForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [confirm, setConfirm] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    startTransition(async () => {
      const result = await requestAccountClosureAction({ confirm });
      if (!result.ok) setStatus({ ok: false, text: result.error });
      else {
        setStatus({ ok: true, text: "Your account is closed." });
        router.refresh();
      }
    });
  }

  return (
    <form className="fj-form-stack" onSubmit={submit} noValidate>
      <Status state={status} />
      <p className="fj-body-sm">
        Closing your account stops new tracking. Any balance that has already
        cleared is still paid. Your history stays available if you sign back in.
      </p>
      <div className="fj-field">
        <label htmlFor="aff-close">
          Type <strong>close my account</strong> to confirm
        </label>
        <input
          id="aff-close"
          className="fj-input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="close my account"
        />
      </div>
      <div>
        <BrandButton
          type="submit"
          variant="secondary"
          disabled={pending || confirm !== "close my account"}
        >
          {pending ? "Closing..." : "Close my account"}
        </BrandButton>
      </div>
    </form>
  );
}
