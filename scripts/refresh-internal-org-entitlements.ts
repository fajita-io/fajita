#!/usr/bin/env npx tsx
/**
 * Refresh entitlement snapshots for internal (platform) organizations.
 *
 *   npx tsx scripts/refresh-internal-org-entitlements.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import postgres from "postgres";

import {
  BETA_ENTITLEMENTS,
  ENTITLEMENT_VERSION,
} from "../src/lib/billing/catalog";

function loadEnv(): void {
  const prodPath = resolve(process.cwd(), ".env.production.local");
  if (!existsSync(prodPath)) return;
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

function poolerUrl(): string {
  const direct = process.env.DATABASE_URL?.trim();
  if (!direct) throw new Error("DATABASE_URL missing");
  if (direct.includes("pooler.supabase.com")) return direct;
  const parsed = new URL(direct);
  const password = parsed.password;
  const ref = process.env.SUPABASE_PROJECT_REF?.trim() ?? "olvnjsqspvywvwfchtuc";
  const region = process.env.SUPABASE_DB_REGION?.trim() ?? "us-east-2";
  const poolHost =
    process.env.SUPABASE_POOLER_HOST?.trim() ??
    `aws-1-${region}.pooler.supabase.com`;
  return `postgresql://postgres.${ref}:${password}@${poolHost}:6543/postgres`;
}

async function main(): Promise<void> {
  loadEnv();
  const sql = postgres(poolerUrl(), {
    ssl: "require",
    max: 1,
    prepare: false,
    connect_timeout: 20,
  });

  try {
    const orgs = await sql<{ id: string; slug: string; name: string }[]>`
      select id, slug, name
      from public.organizations
      where is_internal = true
    `;

    if (!orgs.length) {
      console.log("No internal organizations found.");
      return;
    }

    const entitlements = BETA_ENTITLEMENTS;
    const now = new Date().toISOString();

    for (const org of orgs) {
      await sql`
        delete from public.billing_entitlement_snapshots
        where organization_id = ${org.id}::uuid
          and source = 'current'
      `;

      await sql`
        insert into public.billing_entitlement_snapshots (
          organization_id,
          subscription_id,
          plan_key,
          entitlement_version,
          access_state,
          entitlements,
          calculated_at,
          source
        ) values (
          ${org.id}::uuid,
          null,
          null,
          ${ENTITLEMENT_VERSION},
          'active',
          ${sql.json(entitlements)},
          ${now}::timestamptz,
          'current'
        )
      `;

      await sql`
        insert into public.billing_entitlement_snapshots (
          organization_id,
          subscription_id,
          plan_key,
          entitlement_version,
          access_state,
          entitlements,
          calculated_at,
          source
        ) values (
          ${org.id}::uuid,
          null,
          null,
          ${ENTITLEMENT_VERSION},
          'active',
          ${sql.json(entitlements)},
          ${now}::timestamptz,
          'internal_refresh'
        )
      `;

      console.log(
        `Refreshed ${org.slug ?? org.name}: monitoring_enabled=true, max_monthly_checks=${BETA_ENTITLEMENTS.max_monthly_checks}`,
      );
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
