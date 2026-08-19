import "server-only";

import { generateToken, hashToken } from "@/lib/status-pages/secret";
import { serviceClient } from "@/lib/supabase/service";
import { serverEnv } from "@/lib/env";
import { emailAppLink } from "@/lib/email/links";

export function issueRecipientToken(): { token: string; tokenHash: string } {
  const token = generateToken(32);
  return { token, tokenHash: hashToken(token) };
}

export function recipientVerifyUrl(token: string): string {
  return emailAppLink(`/alert-recipients/verify?token=${encodeURIComponent(token)}`);
}

async function sendVerifyMail(to: string, token: string): Promise<boolean> {
  const env = serverEnv();
  if (!env.RESEND_API_KEY) return false;
  const from = env.ALERT_EMAIL_FROM || "Fajita Alerts <alerts@fajita.io>";
  const url = recipientVerifyUrl(token);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Confirm this address for Fajita alerts",
      text: [
        "Confirm this email address to receive Fajita incident alerts.",
        "",
        url,
        "",
        "This link expires in 7 days. If you did not expect this, ignore it.",
      ].join("\n"),
      html: `<p>Confirm this email address to receive Fajita incident alerts.</p><p><a href="${url}">Confirm this address</a></p><p>This link expires in 7 days. If you did not expect this, ignore it.</p>`,
    }),
  });
  return res.ok;
}

export async function sendRecipientVerification(params: {
  organizationId: string;
  recipientId: string;
}): Promise<{ sent: boolean }> {
  const db = serviceClient();
  const { data, error } = await db
    .from("alert_email_recipients")
    .select("id, email, verification_status, removed_at")
    .eq("id", params.recipientId)
    .eq("organization_id", params.organizationId)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.removed_at) return { sent: false };
  if (data.verification_status === "verified") return { sent: false };

  const issued = issueRecipientToken();
  const { error: updateError } = await db
    .from("alert_email_recipients")
    .update({ verification_token_hash: issued.tokenHash })
    .eq("id", data.id)
    .eq("organization_id", params.organizationId);
  if (updateError) throw updateError;

  const sent = await sendVerifyMail(String(data.email), issued.token);
  return { sent };
}

export async function sendPendingRecipientVerifications(params: {
  organizationId: string;
  recipientIds: string[];
}): Promise<void> {
  for (const recipientId of params.recipientIds) {
    try {
      await sendRecipientVerification({
        organizationId: params.organizationId,
        recipientId,
      });
    } catch {
      // Creating the channel should still succeed if mail fails.
    }
  }
}

export type ConfirmRecipientResult =
  | { kind: "confirmed" }
  | { kind: "already_confirmed" }
  | { kind: "invalid" };

export async function confirmAlertRecipient(token: string): Promise<ConfirmRecipientResult> {
  const trimmed = token.trim();
  if (!trimmed) return { kind: "invalid" };
  const tokenHash = hashToken(trimmed);
  const db = serviceClient();
  const { data, error } = await db
    .from("alert_email_recipients")
    .select("id, verification_status, verification_token_hash")
    .eq("verification_token_hash", tokenHash)
    .is("removed_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { kind: "invalid" };
  if (data.verification_status === "verified") return { kind: "already_confirmed" };

  const { error: updateError } = await db
    .from("alert_email_recipients")
    .update({
      verification_status: "verified",
      verified_at: new Date().toISOString(),
      verification_token_hash: null,
    })
    .eq("id", data.id);
  if (updateError) throw updateError;
  return { kind: "confirmed" };
}

