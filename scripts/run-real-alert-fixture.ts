#!/usr/bin/env tsx
/**
 * Production alert delivery fixture (LB-007).
 *
 * Exercises email (Resend), Slack, Discord, and signed webhook delivery.
 * Creates temporary webhook.site receivers when env URLs are not set.
 */
import { createHmac } from "node:crypto";

import { loadEnvConfig } from "@next/env";

const ROOT = new URL("..", import.meta.url).pathname;
loadEnvConfig(ROOT);

const FIXTURE_SUBJECT = "[Test] Fajita alert channel test";
const FIXTURE_SUMMARY =
  "Production alert fixture. If you can read this, the channel is wired correctly.";

interface WebhookSiteToken {
  uuid: string;
  url: string;
}

async function createWebhookSite(label: string): Promise<WebhookSiteToken> {
  const res = await fetch("https://webhook.site/token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ default_status: 200, expiry: 3600 }),
  });
  if (!res.ok) throw new Error(`webhook.site token create failed for ${label}`);
  const body = (await res.json()) as { uuid: string };
  return { uuid: body.uuid, url: `https://webhook.site/${body.uuid}` };
}

async function webhookSiteReceived(uuid: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 1500));
  const res = await fetch(`https://webhook.site/token/${uuid}/requests?sorting=newest`);
  if (!res.ok) return false;
  const body = (await res.json()) as { data?: unknown[] };
  return (body.data?.length ?? 0) > 0;
}

async function sendResendTest(to: string): Promise<{ ok: boolean; detail: string }> {
  const apiKey =
    process.env.RESEND_FULL_API_KEY?.trim() ??
    process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, detail: "RESEND_API_KEY missing" };
  const from = process.env.ALERT_EMAIL_FROM?.trim() ?? "Fajita <alerts@fajita.io>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: FIXTURE_SUBJECT,
      text: FIXTURE_SUMMARY,
    }),
  });
  const body = (await res.json()) as { id?: string; message?: string };
  return {
    ok: res.ok,
    detail: res.ok ? `delivered id=${body.id}` : (body.message ?? `HTTP ${res.status}`),
  };
}

function slackPayload(): Record<string, unknown> {
  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: FIXTURE_SUBJECT, emoji: false },
      },
      { type: "section", text: { type: "mrkdwn", text: FIXTURE_SUMMARY } },
    ],
  };
}

function discordPayload(): Record<string, unknown> {
  return {
    content: FIXTURE_SUBJECT,
    embeds: [{ description: FIXTURE_SUMMARY, color: 0xa15a2b }],
  };
}

function signedWebhookBody(): { body: string; headers: Record<string, string> } {
  const secret = process.env.LAUNCH_ALERT_TEST_WEBHOOK_SECRET?.trim() ?? "launch-fixture-secret";
  const eventId = crypto.randomUUID();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const body = JSON.stringify({
    id: eventId,
    type: "incident.opened",
    test: true,
    summary: FIXTURE_SUMMARY,
    created_at: new Date().toISOString(),
  });
  const signed = `${timestamp}.${body}`;
  const signature = createHmac("sha256", secret).update(signed).digest("hex");
  return {
    body,
    headers: {
      "content-type": "application/json",
      "x-fajita-event-id": eventId,
      "x-fajita-timestamp": timestamp,
      "x-fajita-signature": `v1=${signature}`,
    },
  };
}

async function postJson(
  url: string,
  payload: Record<string, unknown> | string,
  headers: Record<string, string> = { "content-type": "application/json" },
): Promise<{ ok: boolean; detail: string }> {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  const res = await fetch(url, { method: "POST", headers, body });
  return {
    ok: res.ok,
    detail: res.ok ? `HTTP ${res.status}` : `HTTP ${res.status}`,
  };
}

async function main(): Promise<void> {
  const results: { channel: string; ok: boolean; detail: string }[] = [];

  const email =
    process.env.LAUNCH_ALERT_TEST_EMAIL?.trim() ?? "alex@accompli.sh";
  results.push({ channel: "email", ...(await sendResendTest(email)) });

  let slackUrl = process.env.LAUNCH_ALERT_TEST_SLACK_WEBHOOK?.trim();
  let slackToken: WebhookSiteToken | null = null;
  if (!slackUrl) {
    slackToken = await createWebhookSite("slack");
    slackUrl = slackToken.url;
    console.log(`Slack receiver: ${slackUrl}`);
  }
  const slackPost = await postJson(slackUrl, slackPayload());
  const slackOk =
    slackPost.ok &&
    (slackToken ? await webhookSiteReceived(slackToken.uuid) : true);
  results.push({
    channel: "slack",
    ok: slackOk,
    detail: slackOk ? slackPost.detail : "delivery not observed",
  });

  let discordUrl = process.env.LAUNCH_ALERT_TEST_DISCORD_WEBHOOK?.trim();
  let discordToken: WebhookSiteToken | null = null;
  if (!discordUrl) {
    discordToken = await createWebhookSite("discord");
    discordUrl = discordToken.url;
    console.log(`Discord receiver: ${discordUrl}`);
  }
  const discordPost = await postJson(
    `${discordUrl}${discordUrl.includes("?") ? "&" : "?"}wait=true`,
    discordPayload(),
  );
  const discordOk =
    discordPost.ok &&
    (discordToken ? await webhookSiteReceived(discordToken.uuid) : true);
  results.push({
    channel: "discord",
    ok: discordOk,
    detail: discordOk ? discordPost.detail : "delivery not observed",
  });

  let webhookUrl = process.env.LAUNCH_ALERT_TEST_WEBHOOK_URL?.trim();
  let webhookToken: WebhookSiteToken | null = null;
  if (!webhookUrl) {
    webhookToken = await createWebhookSite("webhook");
    webhookUrl = webhookToken.url;
    console.log(`Webhook receiver: ${webhookUrl}`);
  }
  const signed = signedWebhookBody();
  const webhookPost = await postJson(webhookUrl, signed.body, signed.headers);
  const webhookOk =
    webhookPost.ok &&
    (webhookToken ? await webhookSiteReceived(webhookToken.uuid) : true);
  results.push({
    channel: "webhook",
    ok: webhookOk,
    detail: webhookOk ? webhookPost.detail : "delivery not observed",
  });

  console.log("\nAlert fixture results:");
  for (const r of results) {
    console.log(`  ${r.ok ? "OK" : "FAIL"} ${r.channel}: ${r.detail}`);
  }

  if (results.some((r) => !r.ok)) process.exit(1);
  console.log("\nProduction alert fixture PASSED (all four channels).");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
