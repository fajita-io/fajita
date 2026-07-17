import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { serviceClient } from "@/lib/supabase/service";

import { redactQuery } from "./search";

const VALID_REASONS = new Set([
  "too_technical",
  "too_basic",
  "missing_example",
  "outdated",
  "did_not_answer",
  "other",
]);

export interface GlossaryFeedbackInput {
  slug: string;
  helpful: boolean;
  reason?: string;
  comment?: string;
  contentVersion: string;
}

function untyped(): SupabaseClient {
  return serviceClient() as unknown as SupabaseClient;
}

export function sanitizeComment(input: string | undefined): string | null {
  if (!input) return null;
  const trimmed = input.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 500).trim();
  if (!trimmed) return null;
  return redactQuery(trimmed).slice(0, 500);
}

export async function recordGlossaryFeedback(
  input: GlossaryFeedbackInput,
): Promise<void> {
  const reason =
    input.reason && VALID_REASONS.has(input.reason) ? input.reason : null;
  const comment = sanitizeComment(input.comment);

  await untyped()
    .from("glossary_feedback")
    .insert({
      slug: input.slug.slice(0, 200),
      helpful: input.helpful,
      reason,
      comment,
      content_version: input.contentVersion.slice(0, 40),
    });
}

export async function recordGlossaryNoResult(
  redactedQuery: string,
  glossaryVersion: string,
): Promise<void> {
  await untyped()
    .from("glossary_search_no_result")
    .insert({
      redacted_query: redactedQuery.slice(0, 120),
      glossary_version: glossaryVersion.slice(0, 40),
    });
}

export interface GlossaryFeedbackRow {
  id: string;
  slug: string;
  helpful: boolean;
  reason: string | null;
  comment: string | null;
  content_version: string;
  resolution_state: string;
  created_at: string;
}

export async function listRecentGlossaryFeedback(
  limit = 100,
): Promise<GlossaryFeedbackRow[]> {
  const { data } = await untyped()
    .from("glossary_feedback")
    .select(
      "id, slug, helpful, reason, comment, content_version, resolution_state, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as GlossaryFeedbackRow[];
}
