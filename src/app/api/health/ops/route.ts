import { NextResponse } from "next/server";

import { deploymentConfig } from "@/lib/deployment/config";
import { activeEmailProvider } from "@/lib/email/transport";
import { BILLING_ENFORCEMENT_ENABLED } from "@/lib/billing/enforcement";
import { isSentryConfigured } from "@/lib/observability/sentry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * Operational health for self-hosted diagnostics. Requires CRON_SECRET bearer.
 * Never exposes secret values.
 */
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const cfg = deploymentConfig();
  let databaseOk = false;
  let migrationOk = false;

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    try {
      const postgres = (await import("postgres")).default;
      const sql = postgres(databaseUrl, { max: 1, prepare: false, connect_timeout: 5 });
      try {
        await sql`select 1`;
        databaseOk = true;
        const rows = await sql`
          select exists (
            select 1 from information_schema.tables
            where table_schema = 'public' and table_name = 'organizations'
          ) as ok
        `;
        migrationOk = Boolean(rows[0]?.ok);
      } finally {
        await sql.end({ timeout: 3 });
      }
    } catch {
      databaseOk = false;
    }
  }

  const workerUrl = process.env.MONITOR_WORKER_HEALTH_URL?.trim();
  let workerOk: boolean | null = null;
  if (workerUrl) {
    try {
      const res = await fetch(`${workerUrl.replace(/\/$/, "")}/readyz`, {
        signal: AbortSignal.timeout(5000),
      });
      workerOk = res.ok;
    } catch {
      workerOk = false;
    }
  }

  return NextResponse.json(
    {
      ok: databaseOk && migrationOk,
      service: "fajita-web",
      version: cfg.version,
      deploymentMode: cfg.mode,
      time: new Date().toISOString(),
      checks: {
        database: databaseOk,
        migrations: migrationOk,
        worker: workerOk,
        emailProvider: activeEmailProvider(),
        billingEnforcement: BILLING_ENFORCEMENT_ENABLED,
        sentryConfigured: isSentryConfigured(),
        analyticsEnabled: cfg.analyticsEnabled,
      },
    },
    { status: 200, headers: { "cache-control": "no-store" } },
  );
}
