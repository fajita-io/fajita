"use server";

import { redirect } from "next/navigation";

import { unsubscribeByToken } from "@/lib/subscribers/lifecycle";

/** Confirm-page unsubscribe (GET shows a button, this POSTs the action). */
export async function confirmUnsubscribeAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  if (!token) redirect("/status-subscriptions/unsubscribe");
  await unsubscribeByToken(token, "email_link");
  redirect(
    `/status-subscriptions/unsubscribe?token=${encodeURIComponent(token)}&done=1`,
  );
}
