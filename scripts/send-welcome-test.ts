#!/usr/bin/env tsx
/**
 * Send one welcome lifecycle email for review.
 *
 * Usage:
 *   npx tsx scripts/send-welcome-test.ts alex@accompli.sh
 *   npx tsx scripts/send-welcome-test.ts alex@accompli.sh --production
 */
import { loadEnvConfig } from "@next/env";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { LIFECYCLE_EMAIL_FIXTURES } from "@/lib/lifecycle/emails/fixtures";
import { renderLifecycleEmail } from "@/lib/lifecycle/emails/templates";
import { LIFECYCLE_MESSAGES } from "@/lib/lifecycle/messages";
import { withEmailBrandAttachments } from "@/lib/email/inline-assets";

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
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (val) process.env[key] = val;
    }
  }
}

async function main() {
  const sandbox = process.argv.includes("--sandbox");
  const to =
    process.argv.find((a) => a.includes("@") && !a.startsWith("--")) ??
    "alex@accompli.sh";
  const apiKey =
    process.env.RESEND_FULL_API_KEY?.trim() ||
    process.env.RESEND_API_KEY?.trim();
  const from =
    (sandbox
      ? "Fajita <onboarding@resend.dev>"
      : process.env.ALERT_EMAIL_FROM?.trim()) || "Fajita <alerts@fajita.io>";

  if (!apiKey) {
    console.error("RESEND_API_KEY or RESEND_FULL_API_KEY is not set.");
    process.exit(1);
  }

  const rendered = renderLifecycleEmail(
    "welcome",
    LIFECYCLE_MESSAGES.welcome.templateVersion,
    {},
  );
  if (!rendered) {
    console.error("Failed to render welcome email.");
    process.exit(1);
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(
      withEmailBrandAttachments({
        from,
        to: [to],
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      }),
    ),
  });

  const json = (await res.json()) as { id?: string; message?: string };
  if (!res.ok) {
    console.error("Send failed:", json.message ?? res.status);
    if (!sandbox && json.message?.includes("not verified")) {
      const usingSendOnly = !process.env.RESEND_FULL_API_KEY?.trim();
      console.error(
        usingSendOnly
          ? "Local RESEND_API_KEY is likely the Vercel Integration send-only key from before domain verification.\n" +
            "Add your fajita-io full access key to .env.local as RESEND_FULL_API_KEY, or replace RESEND_API_KEY with a new send-only key created after fajita.io was verified.\n" +
            "Then retry:\n" +
            "  npx tsx scripts/send-welcome-test.ts alex@accompli.sh"
          : "fajita.io may not be verified for this API key. Check the Resend Domains dashboard, then retry.",
      );
    }
    process.exit(1);
  }

  console.log(
    `Sent welcome email to ${to} from ${from}${json.id ? ` (${json.id})` : ""}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
