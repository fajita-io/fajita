import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { serviceClient } from "@/lib/supabase/service";

import { redactQuery } from "./search";

/**
 * Documentation feedback persistence. All writes are server-side and
 * sanitized. Feedback is anonymous: no user, organization, or IP is stored.
 * The typed Database schema does not yet include these Phase 13 tables, so an
 * untyped client is used here in one place, scoped to two insert-only paths.
 */

const VALID_REASONS = new Set([
  "not_found",
  "unclear",
  "mismatch",
  "example_failed",
  "outdated",
  "other",
]);

export interface FeedbackInput {
  slug: string;
  helpful: boolean;
  reason?: string;
  comment?: string;
  docsVersion: string;
  productVersion?: string;
}

function untyped(): SupabaseClient {
  return serviceClient() as unknown as SupabaseClient;
}

/** Sanitize free-text: strip control chars, cap length, redact secret-like text. */
export function sanitizeComment(input: string | undefined): string | null {
  if (!input) return null;
  const trimmed = input.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 500).trim();
  if (!trimmed) return null;
  // Reuse the query redactor so tokens, emails, and URLs never persist.
  return redactQuery(trimmed).slice(0, 500);
}

export async function recordFeedback(input: FeedbackInput): Promise<void> {
  const reason = input.reason && VALID_REASONS.has(input.reason) ? input.reason : null;
  const comment = sanitizeComment(input.comment);

  await untyped()
    .from("docs_feedback")
    .insert({
      slug: input.slug.slice(0, 200),
      helpful: input.helpful,
      reason,
      comment,
      docs_version: input.docsVersion.slice(0, 40),
      product_version: input.productVersion?.slice(0, 40) ?? null,
    });
}

export async function recordNoResult(redactedQuery: string, docsVersion: string): Promise<void> {
  await untyped()
    .from("docs_search_no_result")
    .insert({ redacted_query: redactedQuery.slice(0, 120), docs_version: docsVersion });
}

export interface FeedbackRow {
  id: string;
  slug: string;
  helpful: boolean;
  reason: string | null;
  comment: string | null;
  docs_version: string;
  resolution_state: string;
  created_at: string;
}

export async function listRecentFeedback(limit = 100): Promise<FeedbackRow[]> {
  const { data } = await untyped()
    .from("docs_feedback")
    .select("id, slug, helpful, reason, comment, docs_version, resolution_state, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as FeedbackRow[];
}
