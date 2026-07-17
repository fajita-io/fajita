"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { useToast } from "../toast";
import { updateLifecyclePreferencesAction } from "@/lib/app/actions/lifecycle-prefs";

export interface LifecyclePrefsValues {
  setup_guidance: boolean;
  weekly_report: boolean;
  incident_recaps: boolean;
  usage_notices: boolean;
  reactivation_reminders: boolean;
}

const ITEMS: {
  key: keyof LifecyclePrefsValues;
  label: string;
  desc: string;
}[] = [
  {
    key: "setup_guidance",
    label: "Setup guidance",
    desc: "A bounded number of reminders while your organization gets connected: finish a draft, add an alert channel, publish a status page. They stop once the step is done.",
  },
  {
    key: "weekly_report",
    label: "Weekly reliability report",
    desc: "One factual email per week covering checks, incidents, certificates, and alert delivery. Skipped for weeks with no meaningful data.",
  },
  {
    key: "incident_recaps",
    label: "Incident recaps",
    desc: "A factual summary after a meaningful incident resolves and recovery holds. One per incident.",
  },
  {
    key: "usage_notices",
    label: "Usage limit notices",
    desc: "A heads-up at 80 and 100 percent of your plan's monitor limit.",
  },
  {
    key: "reactivation_reminders",
    label: "Reactivation reminders",
    desc: "If you cancel, one reminder that your data is still available before the retention period ends.",
  },
];

export function LifecyclePrefsForm({
  initial,
  suppressed,
}: {
  initial: LifecyclePrefsValues;
  suppressed: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    const result = await updateLifecyclePreferencesAction(values);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Email preferences saved. Anything already queued and now disabled was canceled.");
    router.refresh();
  }

  return (
    <form className="fj-form-stack" onSubmit={onSubmit} noValidate>
      {error ? (
        <p className="fj-form-status fj-form-status--error" role="alert">
          {error}
        </p>
      ) : null}

      {suppressed ? (
        <div className="fj-notice" role="status">
          Optional product email to your address is currently paused because a
          previous message bounced or was reported. Required account and
          security notices still arrive. Update your account email in Security
          settings to resume.
        </div>
      ) : null}

      <div className="fj-notice">
        Required service messages, like data deletion notices and cancellation
        confirmations, cannot be turned off here. You need them to keep control
        of the account.
      </div>

      {ITEMS.map((item) => (
        <label key={item.key} className="fj-check">
          <input
            type="checkbox"
            checked={values[item.key]}
            onChange={(e) =>
              setValues((v) => ({ ...v, [item.key]: e.target.checked }))
            }
          />
          <span>
            <strong>{item.label}.</strong> {item.desc}
          </span>
        </label>
      ))}

      <div>
        <BrandButton type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save email preferences"}
        </BrandButton>
      </div>
    </form>
  );
}
