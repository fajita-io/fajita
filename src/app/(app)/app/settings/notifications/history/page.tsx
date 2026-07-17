import type { Metadata } from "next";
import Link from "next/link";

import { AppSection, EmptyState } from "@/components/app/ui";
import { requireAuthenticatedUser } from "@/lib/auth/context";
import { serviceClient } from "@/lib/supabase/service";
import { lifecycleMessage } from "@/lib/lifecycle/messages";

export const metadata: Metadata = {
  title: "Email delivery history",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Queued",
  scheduled: "Scheduled",
  processing: "Sending",
  delivered: "Delivered",
  failed: "Retrying",
  dead_letter: "Could not deliver",
  suppressed: "Not sent",
  canceled: "Canceled",
};

function suppressionCopy(reason: string | null): string | null {
  if (!reason) return null;
  if (reason.startsWith("Preference disabled")) {
    return "Skipped: you have this message type turned off.";
  }
  if (reason.startsWith("Recipient suppressed")) {
    return "Skipped: delivery to your address is paused.";
  }
  if (reason === "preference_disabled") {
    return "Canceled when you turned this message type off.";
  }
  if (reason === "no_longer_current") {
    return "Canceled: the message was no longer relevant.";
  }
  return "Skipped: the message no longer applied.";
}

export default async function LifecycleHistoryPage() {
  const profile = await requireAuthenticatedUser();
  const db = serviceClient();

  const { data: intents } = await db
    .from("lifecycle_delivery_intents")
    .select(
      "id, message_key, message_class, template_version, status, attempt_count, suppression_reason, scheduled_at, completed_at, created_at",
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = intents ?? [];

  return (
    <AppSection
      title="Email delivery"
      description="The last 50 product emails Fajita queued for you, including ones that were skipped and why. Required service messages appear here too."
    >
      {rows.length === 0 ? (
        <EmptyState
          icon="bell"
          title="No product email yet"
          description="When Fajita sends you setup guidance, a weekly report, or a recap, it shows up here with its delivery status."
        />
      ) : (
        <table className="fj-table">
          <thead>
            <tr>
              <th scope="col">Message</th>
              <th scope="col">Status</th>
              <th scope="col">Attempts</th>
              <th scope="col">When</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const def = lifecycleMessage(row.message_key);
              const note =
                row.status === "suppressed" || row.status === "canceled"
                  ? suppressionCopy(row.suppression_reason)
                  : null;
              return (
                <tr key={row.id}>
                  <td>
                    {def?.label ?? row.message_key}
                    <span
                      style={{
                        display: "block",
                        color: "var(--color-text-muted)",
                        fontSize: "0.85em",
                      }}
                    >
                      {note ?? `Template v${row.template_version}`}
                    </span>
                  </td>
                  <td>{STATUS_LABEL[row.status] ?? row.status}</td>
                  <td className="fj-numeric">{row.attempt_count}</td>
                  <td>
                    <time dateTime={row.completed_at ?? row.created_at}>
                      {new Date(
                        row.completed_at ?? row.created_at,
                      ).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p className="fj-app-section__desc" style={{ marginTop: "var(--space-3)" }}>
        <Link className="fj-link-button" href="/app/settings/notifications">
          Back to preferences
        </Link>
      </p>
    </AppSection>
  );
}
