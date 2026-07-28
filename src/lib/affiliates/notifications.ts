import "server-only";

import { serverEnv } from "@/lib/env";
import { serviceClient } from "@/lib/supabase/service";
import {
  heading,
  lifecycleShell,
  paragraph,
  primaryButton,
  detailTable,
  textFooter,
  appLink,
  type RenderedLifecycleEmail,
} from "@/lib/lifecycle/emails/shell";
import { withEmailBrandAttachments } from "@/lib/email/inline-assets";

/**
 * Affiliate notification layer.
 *
 * Records every affiliate-facing message in `affiliate_notifications` (idempotent
 * per dedupe key) and delivers email through the shared Resend transactional
 * stream. It degrades safely: with no provider configured, or when the affiliate
 * opted out of the category, the row is marked `skipped` rather than sent. It
 * never blocks the caller (queueing is best effort) and never carries customer
 * identity, Stripe ids, or amounts beyond the affiliate's own earnings.
 *
 * Categories map to `affiliate_email_preferences` columns so opt-out is honored.
 * Account and security-adjacent messages (approval, closure) are treated as
 * required and always attempt delivery.
 */

export type AffiliateNotificationKind =
  | "approved"
  | "first_commission"
  | "payout_sent"
  | "account_closed";

interface EmailPrefRow {
  conversion_notifications: boolean;
  commission_notifications: boolean;
  payout_notifications: boolean;
  program_updates: boolean;
  educational: boolean;
}

/** Which preference column gates a kind. null means the message is required. */
const PREF_COLUMN: Record<AffiliateNotificationKind, keyof EmailPrefRow | null> =
  {
    approved: null,
    first_commission: "commission_notifications",
    payout_sent: "payout_notifications",
    account_closed: null,
  };

export interface QueueInput {
  affiliateId: string;
  kind: AffiliateNotificationKind;
  /** Non-sensitive fields used to render the message. */
  payload?: Record<string, unknown>;
  /** Stable key so the same event never queues twice. */
  dedupeKey: string;
}

/**
 * Queue an affiliate notification. Honors email preferences: opted-out
 * categories are recorded as `skipped`. Safe to call from system contexts;
 * failures are swallowed so they never break commission or payout processing.
 */
export async function queueAffiliateNotification(
  input: QueueInput,
): Promise<void> {
  try {
    const db = serviceClient();
    const prefColumn = PREF_COLUMN[input.kind];

    let optedOut = false;
    if (prefColumn) {
      const { data: prefs } = await db
        .from("affiliate_email_preferences")
        .select(
          "conversion_notifications, commission_notifications, payout_notifications, program_updates, educational",
        )
        .eq("affiliate_id", input.affiliateId)
        .maybeSingle();
      if (prefs) optedOut = prefs[prefColumn] === false;
    }

    await db.from("affiliate_notifications").upsert(
      {
        affiliate_id: input.affiliateId,
        kind: input.kind,
        channel: "email",
        payload: (input.payload ?? {}) as never,
        status: optedOut ? "skipped" : "pending",
        dedupe_key: input.dedupeKey,
      } as never,
      { onConflict: "dedupe_key", ignoreDuplicates: true },
    );
  } catch (error) {
    console.error("[affiliates] queue notification failed", input.kind, error);
  }
}

/** Resolve the affiliate's contact email (profile override, then account email). */
async function contactEmailFor(affiliateId: string): Promise<string | null> {
  const db = serviceClient();
  const { data: profile } = await db
    .from("affiliate_profiles")
    .select("contact_email")
    .eq("affiliate_id", affiliateId)
    .maybeSingle();
  if (profile?.contact_email) return profile.contact_email;

  const { data: affiliate } = await db
    .from("affiliates")
    .select("user_id")
    .eq("id", affiliateId)
    .maybeSingle();
  if (!affiliate) return null;

  const { data: user } = await db
    .from("user_profiles")
    .select("primary_email")
    .eq("id", affiliate.user_id)
    .maybeSingle();
  return user?.primary_email ?? null;
}

/** Render an affiliate notification for the internal lab (no send). */
export function previewAffiliateNotification(
  kind: AffiliateNotificationKind,
  payload: Record<string, unknown> = {},
): RenderedLifecycleEmail {
  return renderEmail(kind, payload);
}

function renderEmail(
  kind: AffiliateNotificationKind,
  payload: Record<string, unknown>,
): RenderedLifecycleEmail {
  const dashboard = appLink("/affiliate");
  switch (kind) {
    case "approved": {
      const link =
        typeof payload.defaultLink === "string" ? payload.defaultLink : dashboard;
      const preview = "You are in. Your referral link is ready.";
      const body =
        heading("You are in.") +
        paragraph(
          "Your Fajita affiliate account is approved. Your referral link is live and every eligible signup is tracked for a full month.",
        ) +
        detailTable([{ label: "Your link", value: link }]) +
        primaryButton("Open your dashboard", dashboard);
      return {
        subject: "Your Fajita affiliate account is approved",
        previewText: preview,
        html: lifecycleShell({
          previewText: preview,
          bodyHtml: body,
          showPreferenceFooter: false,
        }),
        text: `You are in.\n\nYour Fajita affiliate account is approved. Your referral link is live.\n\nYour link: ${link}\nDashboard: ${dashboard}${textFooter(false)}`,
      };
    }
    case "first_commission": {
      const preview = "Your first commission is on the board.";
      const body =
        heading("Your first commission.") +
        paragraph(
          "Someone you referred started paying for Fajita. Your commission is now accruing and will clear after the review period.",
        ) +
        primaryButton("See your earnings", appLink("/affiliate/payouts"));
      return {
        subject: "Your first Fajita commission",
        previewText: preview,
        html: lifecycleShell({
          previewText: preview,
          bodyHtml: body,
          showPreferenceFooter: true,
        }),
        text: `Your first commission.\n\nSomeone you referred started paying for Fajita. Your commission is accruing and clears after the review period.\n\nEarnings: ${appLink("/affiliate/payouts")}${textFooter(true)}`,
      };
    }
    case "payout_sent": {
      const amount =
        typeof payload.amount === "string" ? payload.amount : "your balance";
      const preview = `We sent your payout: ${amount}.`;
      const body =
        heading("Payout sent.") +
        paragraph(
          `We sent ${amount} to your payout account. A statement is waiting in your dashboard.`,
        ) +
        primaryButton("View statement", appLink("/affiliate/payouts"));
      return {
        subject: "Your Fajita payout is on the way",
        previewText: preview,
        html: lifecycleShell({
          previewText: preview,
          bodyHtml: body,
          showPreferenceFooter: true,
        }),
        text: `Payout sent.\n\nWe sent ${amount} to your payout account. A statement is in your dashboard.\n\nStatement: ${appLink("/affiliate/payouts")}${textFooter(true)}`,
      };
    }
    case "account_closed": {
      const preview = "Your affiliate account is closed.";
      const body =
        heading("Your account is closed.") +
        paragraph(
          "Your Fajita affiliate account is now closed. Any balance already cleared will still be paid. Your history stays available if you sign back in.",
        );
      return {
        subject: "Your Fajita affiliate account is closed",
        previewText: preview,
        html: lifecycleShell({
          previewText: preview,
          bodyHtml: body,
          showPreferenceFooter: false,
        }),
        text: `Your account is closed.\n\nYour Fajita affiliate account is now closed. Any cleared balance will still be paid.${textFooter(false)}`,
      };
    }
  }
}

const SEND_TIMEOUT_MS = 15_000;

function fromIdentity(): string {
  const base = serverEnv().ALERT_EMAIL_FROM || "Fajita <hello@fajita.io>";
  const angle = base.match(/<([^>]+)>/);
  const address = angle ? angle[1] : base;
  return `Fajita Partners <${address}>`;
}

async function sendEmail(
  to: string,
  email: RenderedLifecycleEmail,
): Promise<boolean> {
  const env = serverEnv();
  if (!env.RESEND_API_KEY) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(
        withEmailBrandAttachments({
          from: fromIdentity(),
          to: [to],
          subject: email.subject,
          html: email.html,
          text: email.text,
        }),
      ),
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Deliver pending affiliate notifications. Renders and sends each, then records
 * the outcome. Bounded and idempotent (a row is claimed by moving it out of
 * `pending`). Returns counts. Runs from the internal worker.
 */
export async function dispatchAffiliateNotifications(
  limit = 100,
): Promise<{ sent: number; failed: number; skipped: number }> {
  const db = serviceClient();
  const { data: rows } = await db
    .from("affiliate_notifications")
    .select("id, affiliate_id, kind, payload, status")
    .eq("status", "pending")
    .eq("channel", "email")
    .order("created_at", { ascending: true })
    .limit(limit);

  let sent = 0;
  const failed = 0;
  let skipped = 0;

  for (const row of rows ?? []) {
    const to = await contactEmailFor(row.affiliate_id);
    if (!to) {
      await db
        .from("affiliate_notifications")
        .update({ status: "skipped" } as never)
        .eq("id", row.id)
        .eq("status", "pending");
      skipped += 1;
      continue;
    }

    const email = renderEmail(
      row.kind as AffiliateNotificationKind,
      (row.payload as Record<string, unknown>) ?? {},
    );
    const ok = await sendEmail(to, email);
    if (ok) {
      await db
        .from("affiliate_notifications")
        .update({ status: "sent", sent_at: new Date().toISOString() } as never)
        .eq("id", row.id)
        .eq("status", "pending");
      sent += 1;
    } else {
      // No provider configured, or a transient failure: mark skipped so it does
      // not spin. A real provider + retry policy is a follow-up.
      await db
        .from("affiliate_notifications")
        .update({ status: "skipped" } as never)
        .eq("id", row.id)
        .eq("status", "pending");
      skipped += 1;
    }
  }

  return { sent, failed, skipped };
}
