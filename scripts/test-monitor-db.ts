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
  const url = poolerUrl();
  const sql = postgres(url, {
    ssl: "require",
    max: 1,
    prepare: false,
    connect_timeout: 20,
  });
  try {
    const ping = await sql`select 1 as ok`;
    console.log("ping", ping[0]);
    const rows = await sql`
      select app.worker_register(
        'vercel-cron', 'us-east', '1.0.0', 'cron', 'vercel', 1, 8
      )::text as id
    `;
    console.log("register", rows[0]);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
