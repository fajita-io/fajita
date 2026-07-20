#!/usr/bin/env npx tsx
/**
 * Verify Clerk, Supabase, and Stripe are wired for production.
 * Does not print secret values. Exit 1 when required checks fail.
 *
 * Usage:
 *   npx tsx scripts/auth-production-verify.ts
 *   npx tsx scripts/auth-production-verify.ts --production
 */
import { loadEnvConfig } from "@next/env";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  authProductionReady,
  evaluateAuthProductionReadiness,
} from "../src/lib/auth/production-readiness";

// Load .env.local (and .env) the same way Next.js does for dev scripts.
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

const checks = evaluateAuthProductionReadiness({ production });

let failed = 0;
for (const check of checks) {
  const mark = check.ok ? "PASS" : "FAIL";
  if (!check.ok) failed += 1;
  console.log(`${mark} ${check.id}: ${check.detail}`);
}

console.log("");
const ready = authProductionReady({ production });
if (!ready) {
  console.error("Required checks failed for this mode.");
  if (production) {
    console.error("");
    console.error("Production checklist (manual):");
    console.error("1. Clerk Dashboard → Webhooks → https://fajita.io/api/webhooks/clerk");
    console.error("   Events: user.created, user.updated, user.deleted");
    console.error("2. Clerk Dashboard → Supabase integration (https://clerk.com/setup/supabase)");
    console.error("3. Supabase Dashboard → Authentication → Third-party → Clerk (enable)");
    console.error("4. Stripe Dashboard → Webhooks → https://fajita.io/api/webhooks/stripe");
    console.error("5. Vercel Production env: pk_live_/sk_live_ Clerk keys, all webhook secrets");
    console.error("6. Cloudflare DNS: npm run dns:clerk (requires CLOUDFLARE_API_TOKEN)");
    console.error("   Records: clerk.fajita.io, accounts.fajita.io, mail/DKIM CNAMEs");
    console.error("7. Run: clerk auth login && clerk env pull .env.clerk.production --instance prod");
    console.error("See docs/operations/auth-production-setup.md");
  }
  process.exit(1);
}

if (failed > 0 && !production) {
  console.log(
    `${failed} optional check(s) failed (Stripe webhooks, app URL). Core auth wiring is OK for development.`,
  );
} else if (failed > 0) {
  console.error(`${failed} check(s) failed.`);
  process.exit(1);
}

console.log(
  production
    ? "All production auth/billing checks passed."
    : "Development auth wiring looks good.",
);
