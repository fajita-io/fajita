#!/usr/bin/env npx tsx
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import postgres from "postgres";

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
  const parsed = new URL(direct);
  const password = parsed.password;
  const ref = process.env.SUPABASE_PROJECT_REF?.trim() ?? "olvnjsqspvywvwfchtuc";
  return `postgresql://postgres.${ref}:${password}@aws-1-us-east-2.pooler.supabase.com:6543/postgres`;
}

async function main(): Promise<void> {
  loadEnv();
  const sql = postgres(poolerUrl(), {
    ssl: "require",
    max: 1,
    prepare: false,
    connect_timeout: 20,
  });
  const orgId = "95d5b566-2b62-4ff8-b6c2-0de8f714f0ce";
  try {
    console.log("now", (await sql`select now() as now`)[0]);
    console.log(
      "snapshot",
      (
        await sql`
          select access_state,
            entitlements->>'monitoring_enabled' as monitoring_enabled,
            entitlements->>'max_monthly_checks' as max_monthly_checks
          from billing_entitlement_snapshots
          where organization_id = ${orgId}::uuid and source = 'current'
        `
      )[0],
    );
    console.log(
      "at_limit",
      (await sql`select app.org_at_check_limit(${orgId}::uuid) as at_limit`)[0],
    );
    console.log(
      "schedules",
      (
        await sql`
          select count(*) filter (where next_check_at <= now())::int as due,
            count(*) filter (where locked_at is not null)::int as locked,
            min(next_check_at) as next_due
          from check_schedules cs
          join monitors m on m.id = cs.monitor_id
          where m.organization_id = ${orgId}::uuid
        `
      )[0],
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
