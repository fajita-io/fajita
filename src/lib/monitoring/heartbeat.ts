import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { serviceClient } from "@/lib/supabase/service";

/**
 * Heartbeat and cron token foundation. Tokens are high-entropy and stored only
 * as SHA-256 hashes. The raw token is shown once at creation and never
 * retrievable afterward. Ingestion records bounded events and computes the next
 * expected window; the missed-heartbeat incident engine is Phase 6 and is not
 * built here.
 */

const TOKEN_BYTES = 24; // 192 bits of entropy

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function generateToken(): { raw: string; hash: string; masked: string } {
  const raw = randomBytes(TOKEN_BYTES).toString("base64url");
  return {
    raw,
    hash: hashToken(raw),
    masked: `${raw.slice(0, 6)}…${raw.slice(-2)}`,
  };
}

export interface HeartbeatTokenSummary {
  id: string;
  maskedLabel: string;
  state: string;
  expectedIntervalSeconds: number;
  gracePeriodSeconds: number;
  lastHeartbeatAt: string | null;
  nextExpectedAt: string | null;
  createdAt: string;
}

/**
 * Create a heartbeat token for a monitor. Returns the raw token exactly once;
 * the caller must surface it immediately and never persist it in plaintext.
 */
export async function createHeartbeatToken(params: {
  organizationId: string;
  monitorId: string;
  actorProfileId: string;
  expectedIntervalSeconds: number;
  gracePeriodSeconds: number;
}): Promise<{ id: string; rawToken: string; maskedLabel: string }> {
  const db = serviceClient();
  const token = generateToken();

  const { data, error } = await db
    .from("heartbeat_tokens")
    .insert({
      monitor_id: params.monitorId,
      organization_id: params.organizationId,
      token_hash: token.hash,
      masked_label: token.masked,
      expected_interval_seconds: params.expectedIntervalSeconds,
      grace_period_seconds: params.gracePeriodSeconds,
      state: "pending",
      created_by_user_id: params.actorProfileId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id, rawToken: token.raw, maskedLabel: token.masked };
}

/** Rotate a token: new hash, new masked label, rotated_at set. */
export async function rotateHeartbeatToken(params: {
  organizationId: string;
  tokenId: string;
}): Promise<{ rawToken: string; maskedLabel: string }> {
  const db = serviceClient();
  const token = generateToken();
  const { error } = await db
    .from("heartbeat_tokens")
    .update({
      token_hash: token.hash,
      masked_label: token.masked,
      rotated_at: new Date().toISOString(),
      state: "pending",
    })
    .eq("id", params.tokenId)
    .eq("organization_id", params.organizationId)
    .is("revoked_at", null);
  if (error) throw error;
  return { rawToken: token.raw, maskedLabel: token.masked };
}

/** Revoke a token. */
export async function revokeHeartbeatToken(params: {
  organizationId: string;
  tokenId: string;
}): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("heartbeat_tokens")
    .update({ revoked_at: new Date().toISOString(), state: "revoked" })
    .eq("id", params.tokenId)
    .eq("organization_id", params.organizationId);
  if (error) throw error;
}

export async function listHeartbeatTokens(
  organizationId: string,
  monitorId: string,
): Promise<HeartbeatTokenSummary[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("heartbeat_tokens")
    .select(
      "id, masked_label, state, expected_interval_seconds, grace_period_seconds, last_heartbeat_at, next_expected_at, created_at",
    )
    .eq("organization_id", organizationId)
    .eq("monitor_id", monitorId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    maskedLabel: r.masked_label,
    state: r.state,
    expectedIntervalSeconds: r.expected_interval_seconds,
    gracePeriodSeconds: r.grace_period_seconds,
    lastHeartbeatAt: r.last_heartbeat_at,
    nextExpectedAt: r.next_expected_at,
    createdAt: r.created_at,
  }));
}

export type IngestOutcome =
  | { ok: true; deduped: boolean }
  | { ok: false; reason: "not_found" | "revoked" | "suspended" };

/**
 * Ingest a heartbeat ping. Verifies the hashed token, honors organization
 * suspension, records a bounded event (idempotent when an external event id is
 * supplied), and advances the expected window. Never reveals whether a token
 * exists beyond the coarse outcome the route maps to a generic response.
 */
export async function ingestHeartbeat(params: {
  rawToken: string;
  source: "get" | "post";
  externalEventId?: string | null;
  safeMetadata?: Record<string, unknown> | null;
}): Promise<IngestOutcome> {
  const db = serviceClient();
  const tokenHash = hashToken(params.rawToken);

  const { data: token, error } = await db
    .from("heartbeat_tokens")
    .select(
      "id, monitor_id, organization_id, expected_interval_seconds, state, revoked_at",
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (error) throw error;
  if (!token || token.revoked_at) return { ok: false, reason: "not_found" };
  if (token.state === "revoked") return { ok: false, reason: "revoked" };

  // Organization suspension excludes ingestion.
  const { data: org } = await db
    .from("organizations")
    .select("status")
    .eq("id", token.organization_id)
    .maybeSingle();
  if (org?.status && org.status !== "active") {
    return { ok: false, reason: "suspended" };
  }

  const now = new Date();
  const nextExpected = new Date(
    now.getTime() + token.expected_interval_seconds * 1000,
  );

  const insert = await db
    .from("heartbeat_events")
    .insert({
      heartbeat_token_id: token.id,
      monitor_id: token.monitor_id,
      organization_id: token.organization_id,
      event_source: params.source,
      external_event_id: params.externalEventId ?? null,
      safe_metadata: (params.safeMetadata ?? null) as never,
    })
    .select("id");

  let deduped = false;
  if (insert.error) {
    // Unique violation on (token, external_event_id) means a retried ping.
    if (insert.error.code === "23505") {
      deduped = true;
    } else {
      throw insert.error;
    }
  }

  await db
    .from("heartbeat_tokens")
    .update({
      last_heartbeat_at: now.toISOString(),
      next_expected_at: nextExpected.toISOString(),
      state: "healthy",
    })
    .eq("id", token.id);

  return { ok: true, deduped };
}
