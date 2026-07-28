import "server-only";

import type { MonitorConfigSnapshot } from "@contracts/contract";
import { CONTRACT_VERSION } from "@contracts/contract";
import postgres from "postgres";

import { serverEnv } from "@/lib/env";

const WORKER_KEY = process.env.MONITOR_CRON_WORKER_KEY?.trim() || "vercel-cron";
const REGION = process.env.MONITOR_CRON_REGION?.trim() || "us-east";
const VERSION = process.env.MONITOR_CRON_VERSION?.trim() || "1.0.0";
const LEASE_BATCH = Number(process.env.MONITOR_CRON_LEASE_BATCH ?? "15");
const LEASE_SECONDS = Number(process.env.MONITOR_CRON_LEASE_SECONDS ?? "55");

export interface LeasedWork {
  monitorId: string;
  organizationId: string;
  monitorVersionId: string;
  scheduledFor: Date;
  generation: number;
  idempotencyKey: string;
}

export interface LoadedMonitor {
  config: MonitorConfigSnapshot;
}

function databaseUrl(): string {
  const direct = serverEnv().DATABASE_URL?.trim();
  if (!direct) throw new Error("DATABASE_URL is not configured.");
  if (direct.includes("pooler.supabase.com")) return direct;
  const parsed = new URL(direct);
  const password = parsed.password;
  const ref =
    process.env.SUPABASE_PROJECT_REF?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\./)?.[1] ??
    "olvnjsqspvywvwfchtuc";
  const region = process.env.SUPABASE_DB_REGION?.trim() ?? "us-east-2";
  const poolHost =
    process.env.SUPABASE_POOLER_HOST?.trim() ??
    `aws-1-${region}.pooler.supabase.com`;
  return `postgresql://postgres.${ref}:${password}@${poolHost}:6543/postgres`;
}

export function openMonitorDb() {
  return postgres(databaseUrl(), {
    ssl: "require",
    max: 3,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
  });
}

export async function registerWorker(
  sql: postgres.Sql,
): Promise<string> {
  const rows = await sql<{ id: string }[]>`
    select app.worker_register(
      ${WORKER_KEY},
      ${REGION},
      ${VERSION},
      ${process.env.VERCEL_GIT_COMMIT_SHA ?? "vercel-cron"},
      ${process.env.VERCEL_DEPLOYMENT_ID ?? "vercel-cron"},
      ${CONTRACT_VERSION},
      8
    )::text as id
  `;
  const id = rows[0]?.id;
  if (!id) throw new Error("Worker registration returned no id.");
  return id;
}

export async function leaseDueChecks(
  sql: postgres.Sql,
  workerId: string,
): Promise<LeasedWork[]> {
  const rows = await sql<
    Array<{
      monitor_id: string;
      organization_id: string;
      monitor_version_id: string;
      scheduled_for: Date;
      schedule_generation: number;
      idempotency_key: string;
    }>
  >`
    select monitor_id::text, organization_id::text, monitor_version_id::text,
           scheduled_for, schedule_generation, idempotency_key
      from app.lease_due_checks(
        ${workerId}::uuid,
        ${REGION},
        ${LEASE_BATCH},
        ${LEASE_SECONDS}
      )
  `;
  return rows.map((row) => ({
    monitorId: row.monitor_id,
    organizationId: row.organization_id,
    monitorVersionId: row.monitor_version_id,
    scheduledFor: row.scheduled_for,
    generation: row.schedule_generation,
    idempotencyKey: row.idempotency_key,
  }));
}

export async function loadMonitor(
  sql: postgres.Sql,
  monitorId: string,
  versionId: string,
): Promise<LoadedMonitor | null> {
  const rows = await sql<{ payload: { config: MonitorConfigSnapshot } | null }[]>`
    select app.worker_load_monitor(${monitorId}::uuid, ${versionId}::uuid) as payload
  `;
  const payload = rows[0]?.payload as { config?: MonitorConfigSnapshot } | null;
  if (!payload?.config) return null;
  return { config: payload.config };
}

export async function finalizeCheck(
  sql: postgres.Sql,
  input: {
    workerId: string;
    work: LeasedWork;
    leasedAt: Date;
    startedAt: Date;
    completedAt: Date;
    attemptCount: number;
    status: string;
    failureCategory: string | null;
    httpStatus: number | null;
    finalUrl: string | null;
    redirectCount: number;
    responseBytes: number;
    totalMs: number;
    safeErrorMessage: string | null;
    nextCheckAt: Date;
  },
): Promise<string | null> {
  const rows = await sql<{ id: string | null }[]>`
    select app.finalize_check(
      ${input.work.idempotencyKey},
      ${input.work.monitorId}::uuid,
      ${input.work.monitorVersionId}::uuid,
      ${input.work.organizationId}::uuid,
      ${input.workerId}::uuid,
      ${REGION},
      ${input.work.scheduledFor.toISOString()}::timestamptz,
      ${input.leasedAt.toISOString()}::timestamptz,
      ${input.startedAt.toISOString()}::timestamptz,
      ${input.completedAt.toISOString()}::timestamptz,
      ${input.attemptCount},
      ${input.status},
      ${"completed"},
      ${input.failureCategory},
      ${input.httpStatus},
      ${input.finalUrl},
      ${input.redirectCount},
      ${input.responseBytes},
      0, 0, 0, 0,
      ${input.totalMs},
      null::jsonb,
      null,
      ${input.safeErrorMessage},
      '[]'::jsonb,
      null::uuid,
      false,
      ${input.nextCheckAt.toISOString()}::timestamptz
    )::text as id
  `;
  return rows[0]?.id ?? null;
}

export async function workerHeartbeat(
  sql: postgres.Sql,
  workerId: string,
  activeLeases: number,
): Promise<void> {
  await sql`
    select app.worker_heartbeat(
      ${workerId}::uuid,
      ${"healthy"},
      ${activeLeases},
      0,
      0,
      0,
      0
    )
  `;
}

export async function expireStaleLeases(sql: postgres.Sql): Promise<number> {
  const rows = await sql<{ n: number }[]>`select app.expire_stale_leases() as n`;
  return rows[0]?.n ?? 0;
}

export async function processIncidentEvaluations(
  sql: postgres.Sql,
  batch = 50,
): Promise<number> {
  const rows = await sql<{ n: number }[]>`
    select app.process_incident_evaluations(${batch}, ${1}) as n
  `;
  return rows[0]?.n ?? 0;
}

export async function detectMissedHeartbeats(sql: postgres.Sql): Promise<number> {
  const rows = await sql<{ n: number }[]>`select app.detect_missed_heartbeats() as n`;
  return rows[0]?.n ?? 0;
}

export function nextCheckAt(intervalSeconds: number): Date {
  const jitterMs = Math.floor(Math.random() * Math.min(15_000, intervalSeconds * 1000));
  return new Date(Date.now() + intervalSeconds * 1000 + jitterMs);
}
