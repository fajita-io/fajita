"use server";

import { redirect } from "next/navigation";

import { updatePreferencesByToken } from "@/lib/subscribers/preferences";
import { unsubscribeByToken, requestDeletionByToken } from "@/lib/subscribers/lifecycle";
import type { SimplePreferenceChoice } from "@/lib/subscribers/prefs";

/**
 * Server actions for the passwordless preference center. The token is the only
 * credential: it is carried in a hidden field, validated server-side by HMAC +
 * link version, and never logged or placed in analytics.
 */

function base(token: string): string {
  return `/status-subscriptions/preferences?token=${encodeURIComponent(token)}`;
}

export async function savePreferencesAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  if (!token) redirect("/status-subscriptions/preferences");

  const allComponents = formData.get("scope") !== "selected";
  const componentIds = formData
    .getAll("component")
    .map((c) => String(c))
    .filter(Boolean);

  const choice: SimplePreferenceChoice = {
    allComponents,
    componentIds,
    incidentUpdates: formData.get("incidentUpdates") === "on",
    maintenanceUpdates: formData.get("maintenanceUpdates") === "on",
  };

  const result = await updatePreferencesByToken(token, choice);
  redirect(`${base(token)}&saved=${result.ok ? "1" : "0"}`);
}

export async function unsubscribeAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  if (!token) redirect("/status-subscriptions/preferences");
  await unsubscribeByToken(token, "preference_center");
  redirect(`${base(token)}&unsubscribed=1`);
}

export async function requestDeletionAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  if (!token) redirect("/status-subscriptions/preferences");
  await requestDeletionByToken(token);
  // The token is rotated by the deletion request, so send the visitor to a
  // terminal confirmation rather than back to a now-dead preference link.
  redirect(`/status-subscriptions/preferences?deleted=1`);
}
