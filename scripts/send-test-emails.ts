#!/usr/bin/env tsx
/**
 * Send one copy of every Fajita email template to a review inbox via Resend.
 *
 * Usage:
 *   npx tsx scripts/send-test-emails.ts alex@accompli.sh
 *   npx tsx scripts/send-test-emails.ts alex@accompli.sh --production
 */
import { loadEnvConfig } from "@next/env";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { renderEmail, previewContext } from "@/lib/alerts/messages";
import {
  appLink,
  detailTable,
  heading,
  lifecycleShell,
  paragraph,
  primaryButton,
  textFooter,
} from "@/lib/lifecycle/emails/shell";
import { LIFECYCLE_EMAIL_FIXTURES } from "@/lib/lifecycle/emails/fixtures";
import { renderLifecycleEmail } from "@/lib/lifecycle/emails/templates";
import {
  LIFECYCLE_MESSAGE_KEYS,
  LIFECYCLE_MESSAGES,
  type LifecycleMessageKey,
} from "@/lib/lifecycle/messages";
import { SUBSCRIBER_EVENT_TYPES } from "@/lib/subscribers/constants";
import type { StatusPageEmailContext } from "@/lib/subscribers/context";
import {
  renderConfirmationEmail,
  renderEventEmail,
  type RenderPayload,
} from "@/lib/subscribers/templates";

loadEnvConfig(process.cwd());

const production = process.argv.includes("--production");
if (production) {
  const prodPath = resolve(process.cwd(), ".env.production.local");
  if (existsSync(prodPath)) {
    for (const line of readFileSync(prodPath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq);
      let val = trimmed.slice(eq + 1);
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const TO = process.argv.find((a) => a.includes("@")) ?? "alex@accompli.sh";
const RESEND_SEND_KEY =
  process.env.RESEND_FULL_API_KEY?.trim() ||
  process.env.RESEND_API_KEY?.trim();
const RESEND_ADMIN_KEY =
  process.env.RESEND_FULL_API_KEY?.trim() ||
  process.env.RESEND_API_KEY?.trim();
const fromArgIdx = process.argv.indexOf("--from");
const FROM =
  (fromArgIdx >= 0 ? process.argv[fromArgIdx + 1] : null)?.trim() ||
  process.env.ALERT_EMAIL_FROM?.trim() ||
  "Fajita <alerts@fajita.io>";
const RESEND_DOMAIN = process.env.RESEND_DOMAIN ?? "fajita.io";

interface Outbound {
  category: string;
  label: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

function verifiedAddress(from: string): string {
  const angle = from.match(/<([^>]+)>/);
  return angle ? angle[1] : from;
}

function lifecycleFromAddress(messageKey: string): string {
  const definition = LIFECYCLE_MESSAGES[messageKey as LifecycleMessageKey];
  const name = definition?.class === "report" ? "Fajita Reports" : "Fajita";
  return `${name} <${verifiedAddress(FROM)}>`;
}

function affiliateFrom(): string {
  return `Fajita <${verifiedAddress(FROM)}>`;
}

function subscriberFrom(name: string): string {
  const clean = name.replace(/[<>"\r\n]/g, "").slice(0, 60);
  return `${clean} via Fajita <${verifiedAddress(FROM)}>`;
}

function renderAffiliate(
  kind: "approved" | "first_commission" | "payout_sent" | "account_closed",
): Outbound {
  const dashboard = appLink("/affiliate");
  switch (kind) {
    case "approved": {
      const link = dashboard;
      const preview = "You are in. Your referral link is ready.";
      const body =
        heading("You are in.") +
        paragraph(
          "Your Fajita affiliate account is approved. Your referral link is live and every eligible signup is tracked for a full month.",
        ) +
        detailTable([{ label: "Your link", value: link }]) +
        primaryButton("Open your dashboard", dashboard);
      return {
        category: "affiliate",
        label: kind,
        subject: "[QA] Your Fajita affiliate account is approved",
        html: lifecycleShell({ previewText: preview, bodyHtml: body, showPreferenceFooter: false }),
        text: `You are in.\n\nYour link: ${link}\nDashboard: ${dashboard}${textFooter(false)}`,
        from: affiliateFrom(),
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
        category: "affiliate",
        label: kind,
        subject: "[QA] Your first Fajita commission",
        html: lifecycleShell({ previewText: preview, bodyHtml: body, showPreferenceFooter: true }),
        text: `Your first commission.\n\nEarnings: ${appLink("/affiliate/payouts")}${textFooter(true)}`,
        from: affiliateFrom(),
      };
    }
    case "payout_sent": {
      const amount = "$124.00";
      const preview = `We sent your payout: ${amount}.`;
      const body =
        heading("Payout sent.") +
        paragraph(
          `We sent ${amount} to your payout account. A statement is waiting in your dashboard.`,
        ) +
        primaryButton("View statement", appLink("/affiliate/payouts"));
      return {
        category: "affiliate",
        label: kind,
        subject: "[QA] Your Fajita payout is on the way",
        html: lifecycleShell({ previewText: preview, bodyHtml: body, showPreferenceFooter: true }),
        text: `Payout sent.\n\nStatement: ${appLink("/affiliate/payouts")}${textFooter(true)}`,
        from: affiliateFrom(),
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
        category: "affiliate",
        label: kind,
        subject: "[QA] Your Fajita affiliate account is closed",
        html: lifecycleShell({ previewText: preview, bodyHtml: body, showPreferenceFooter: false }),
        text: `Your account is closed.${textFooter(false)}`,
        from: affiliateFrom(),
      };
    }
  }
}

const subscriberCtx: StatusPageEmailContext = {
  statusPageId: "00000000-0000-0000-0000-000000000001",
  organizationId: "00000000-0000-0000-0000-000000000002",
  name: "Canyon Software Status",
  slug: "canyon",
  accentColor: "#b53a0a",
  logoUrl: null,
  websiteUrl: "https://canyon.example",
  supportUrl: "https://canyon.example/support",
  privacyUrl: "https://fajita.io/legal/subscriber-privacy",
  poweredByRemoved: false,
  replyTo: null,
  timezone: "America/Denver",
  statusPageUrl: "https://status.canyon.example",
};

const subscriberLinks = {
  statusPageUrl: subscriberCtx.statusPageUrl,
  preferenceUrl: "https://fajita.io/subscribers/preferences/preview-token",
  unsubscribeUrl: "https://fajita.io/subscribers/unsubscribe/preview-token",
};

function subscriberPayload(eventType: (typeof SUBSCRIBER_EVENT_TYPES)[number]): RenderPayload {
  return {
    eventType,
    title: "Checkout API latency",
    statusLabel: eventType.includes("resolved")
      ? "Resolved"
      : eventType.includes("maintenance")
        ? "Scheduled"
        : "Investigating",
    severityLabel: "Major",
    affectedComponents: ["Checkout", "Payments API"],
    summary:
      "We are seeing elevated error rates on the checkout API. Engineers are investigating.",
    startedAt: "2026-07-20T18:00:00.000Z",
    scheduledStart: "2026-07-22T02:00:00.000Z",
    scheduledEnd: "2026-07-22T04:00:00.000Z",
    resolvedAt: eventType.includes("resolved") ? "2026-07-20T19:12:00.000Z" : null,
    completedAt: eventType === "maintenance_completed" ? "2026-07-22T04:05:00.000Z" : null,
    canceledAt: eventType === "maintenance_canceled" ? "2026-07-21T12:00:00.000Z" : null,
    durationText: "1h 12m",
    incidentUrl: `${subscriberCtx.statusPageUrl}/incidents/preview`,
  };
}

const ALERT_EVENT_TYPES = [
  "incident.opened",
  "incident.resolved",
  "incident.updated",
  "maintenance.scheduled",
  "maintenance.started",
  "monitor.ssl_critical",
  "monitor.ssl_restored",
  "monitor.heartbeat_missed",
  "monitor.flapping",
] as const;

function collectOutbounds(): Outbound[] {
  const out: Outbound[] = [];

  for (const key of LIFECYCLE_MESSAGE_KEYS) {
    const definition = LIFECYCLE_MESSAGES[key];
    const rendered = renderLifecycleEmail(
      key,
      definition.templateVersion,
      LIFECYCLE_EMAIL_FIXTURES[key],
    );
    if (!rendered) continue;
    out.push({
      category: "lifecycle",
      label: key,
      subject: `[QA] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
      from: lifecycleFromAddress(key),
    });
  }

  for (const kind of [
    "approved",
    "first_commission",
    "payout_sent",
    "account_closed",
  ] as const) {
    out.push(renderAffiliate(kind));
  }

  const confirmation = renderConfirmationEmail(subscriberCtx, {
    confirmUrl: "https://fajita.io/subscribers/confirm/preview-token",
    expiresHours: 48,
    scopeSummary: "All components",
    eventSummary: "Incidents and maintenance",
    explanation:
      "Confirm you want status updates from Canyon Software when incidents or maintenance affect the services you selected.",
  });
  out.push({
    category: "subscriber",
    label: "confirmation",
    subject: `[QA] ${confirmation.subject}`,
    html: confirmation.html,
    text: confirmation.text,
    from: subscriberFrom(subscriberCtx.name),
  });

  for (const eventType of SUBSCRIBER_EVENT_TYPES) {
    const rendered = renderEventEmail(
      subscriberCtx,
      subscriberPayload(eventType),
      subscriberLinks,
    );
    out.push({
      category: "subscriber",
      label: eventType,
      subject: `[QA] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
      from: subscriberFrom(subscriberCtx.name),
    });
  }

  for (const eventType of ALERT_EVENT_TYPES) {
    const ctx = {
      ...previewContext("email", eventType),
      isRecovery:
        eventType.includes("resolved") || eventType.includes("restored"),
      maintenance:
        eventType.startsWith("maintenance.")
          ? {
              startsAt: "2026-07-22T02:00:00.000Z",
              endsAt: "2026-07-22T04:00:00.000Z",
              timezone: "UTC",
            }
          : null,
    };
    const rendered = renderEmail(ctx);
    out.push({
      category: "alert",
      label: eventType,
      subject: `[QA] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
      from: FROM.replace(/^Fajita Alerts/, "Fajita Alerts QA") || FROM,
    });
  }

  const testCtx = { ...previewContext("email"), isTest: true };
  const testRendered = renderEmail(testCtx);
  out.push({
    category: "alert",
    label: "channel_test",
    subject: `[QA] ${testRendered.subject}`,
    html: testRendered.html,
    text: testRendered.text,
    from: FROM,
  });

  return out;
}

async function sendOne(item: Outbound): Promise<{ ok: boolean; id?: string; error?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${RESEND_SEND_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: item.from ?? FROM,
      to: [TO],
      subject: item.subject,
      html: item.html,
      text: item.text,
    }),
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const json = (await res.json()) as { message?: string };
      if (json.message) message = json.message;
    } catch {
      // ignore
    }
    return { ok: false, error: message };
  }
  try {
    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id };
  } catch {
    return { ok: true };
  }
}

async function ensureSendingDomainVerified(): Promise<void> {
  const res = await fetch("https://api.resend.com/domains", {
    headers: { authorization: `Bearer ${RESEND_ADMIN_KEY}` },
  });
  const json = (await res.json()) as {
    data?: Array<{ name: string; status: string }>;
    message?: string;
  };
  if (!res.ok) {
    if (json.message?.includes("restricted to only send")) {
      console.warn(
        "Skipping domain preflight (send-only API key). Sends may fail until fajita.io is verified.",
      );
      return;
    }
    throw new Error(json.message ?? `Resend domains list failed (${res.status})`);
  }
  const domain = json.data?.find((d) => d.name === RESEND_DOMAIN);
  if (!domain) {
    throw new Error(
      `Resend domain ${RESEND_DOMAIN} not found. Run: RESEND_FULL_API_KEY=... npm run resend:fetch-dns`,
    );
  }
  if (domain.status !== "verified") {
    throw new Error(
      `Resend domain ${RESEND_DOMAIN} is ${domain.status}, not verified. ` +
        `Publish DNS records, then retry:\n` +
        `  CLOUDFLARE_API_TOKEN=... RESEND_DOMAIN=${RESEND_DOMAIN} npm run dns:email\n` +
        `Then send with a matching from address, e.g.:\n` +
        `  npx tsx scripts/send-test-emails.ts ${TO} --production --from "Fajita <alerts@${RESEND_DOMAIN}>"`,
    );
  }
}

async function main() {
  if (!RESEND_SEND_KEY) {
    console.error(
      "RESEND_API_KEY or RESEND_FULL_API_KEY is not set. Load .env.local or use --production.",
    );
    process.exit(1);
  }

  try {
    await ensureSendingDomainVerified();
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const items = collectOutbounds();
  console.log(`Sending ${items.length} test emails to ${TO} from ${FROM}`);
  console.log(`Env: ${production ? "production (.env.production.local merged)" : "local"}`);

  let sent = 0;
  let failed = 0;

  for (const item of items) {
    const result = await sendOne(item);
    if (result.ok) {
      sent += 1;
      console.log(`OK  [${item.category}/${item.label}] ${item.subject}${result.id ? ` (${result.id})` : ""}`);
    } else {
      failed += 1;
      console.error(`FAIL [${item.category}/${item.label}] ${result.error}`);
    }
    await new Promise((r) => setTimeout(r, 350));
  }

  console.log(`\nDone. Sent ${sent}, failed ${failed}.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
