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

import {
  authProductionReady,
  evaluateAuthProductionReadiness,
} from "../src/lib/auth/production-readiness";

// Load .env.local (and .env) the same way Next.js does for dev scripts.
loadEnvConfig(process.cwd());

const production = process.argv.includes("--production");

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
    console.error("6. Run: clerk env pull --instance prod (after clerk auth login)");
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
