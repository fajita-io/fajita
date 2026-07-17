import "server-only";

import { randomUUID } from "node:crypto";

import { serviceClient } from "@/lib/supabase/service";
import { messageKindForEvent, type SubscriberEventType } from "../constants";

/**
 * Subscriber fan-out worker. Leases pending subscriber events and, in bounded
 * cursor-paged batches, turns each confirmed, eligible subscriber into exactly
 * one deduplicated delivery intent (or a recorded suppression when preferences
 * or components do not match). Selection and preference evaluation happen in
 * SQL (next_subscriber_fanout_batch) so we never load all subscribers into app
 * memory. Publishing never calls this on the request path: an event row is
 * committed by publication and this worker fans it out asynchronously.
 */

interface ClaimedEvent {
  id: string;
  organization_id: string;
  status_page_id: string;
  event_type: string;
  content_revision: number;
  public_payload: Record<string, unknown>;
  page_wide: boolean;
  occurred_at: string;
}

interface Candidate {
  subscriber_id: string;
  created_at: string;
  event_pref_ok: boolean;
  component_match: boolean;
}

function matchExplanation(event: ClaimedEvent): string {
  const label = event.event_type.replace(/_/g, " ");
  if (event.page_wide) {
    return `Delivered because this ${label} affects the whole status page and you have these updates enabled.`;
  }
  return `Delivered because this ${label} affects a component you subscribe to and you have these updates enabled.`;
}

async function fanoutEvent(event: ClaimedEvent): Promise<{ eligible: number; intents: number }> {
  const db = serviceClient();
  const messageKind = messageKindForEvent(event.event_type as SubscriberEventType);
  const dedupBase = `${event.id}:${event.content_revision}`;
  const explanation = matchExplanation(event);

  let afterCreated = "1970-01-01T00:00:00.000Z";
  let afterId = "00000000-0000-0000-0000-000000000000";
  let eligible = 0;
  let intents = 0;

  // Bounded loop over cursor-paged batches. Guard against runaway with a hard
  // cap; a page with more subscribers than this in one event is unusual and can
  // be resumed by leaving the event in processing for a later pass.
  for (let guard = 0; guard < 500; guard += 1) {
    const { data: batch, error } = await db.rpc("next_subscriber_fanout_batch", {
      p_event_id: event.id,
      p_after_created: afterCreated,
      p_after_id: afterId,
      p_limit: 500,
    });
    if (error) throw error;
    const rows = (batch ?? []) as unknown as Candidate[];
    if (rows.length === 0) break;

    for (const c of rows) {
      afterCreated = c.created_at;
      afterId = c.subscriber_id;

      if (!c.event_pref_ok) {
        await db.rpc("record_subscriber_suppression", {
          p_organization_id: event.organization_id,
          p_status_page_id: event.status_page_id,
          p_event_id: event.id,
          p_subscriber_id: c.subscriber_id,
          p_event_type: event.event_type,
          p_reason: "event_preference_off",
          p_explanation: "The subscriber has this update type disabled.",
        } as never);
        continue;
      }
      if (!c.component_match) {
        await db.rpc("record_subscriber_suppression", {
          p_organization_id: event.organization_id,
          p_status_page_id: event.status_page_id,
          p_event_id: event.id,
          p_subscriber_id: c.subscriber_id,
          p_event_type: event.event_type,
          p_reason: "no_component_match",
          p_explanation: "The event did not affect a component the subscriber selected.",
        } as never);
        continue;
      }

      eligible += 1;
      const { data: intentId, error: cErr } = await db.rpc("create_subscriber_intent", {
        p_organization_id: event.organization_id,
        p_status_page_id: event.status_page_id,
        p_event_id: event.id,
        p_subscriber_id: c.subscriber_id,
        p_event_type: event.event_type,
        p_message_kind: messageKind,
        p_content_revision: event.content_revision,
        p_render_payload: event.public_payload as never,
        p_match_explanation: explanation,
        p_dedup_key: `${dedupBase}:${c.subscriber_id}`,
        p_is_manual: false,
      } as never);
      if (cErr) throw cErr;
      if (intentId) intents += 1;
    }

    if (rows.length < 500) break;
  }

  return { eligible, intents };
}

export async function runFanoutPass(
  opts: { max?: number } = {},
): Promise<{ events: number; intents: number }> {
  const db = serviceClient();
  const { data: claimed, error } = await db.rpc("claim_subscriber_events", { p_limit: opts.max ?? 10 });
  if (error) throw error;
  const events = (claimed ?? []) as unknown as ClaimedEvent[];

  let totalIntents = 0;
  for (const event of events) {
    try {
      const { eligible, intents } = await fanoutEvent(event);
      totalIntents += intents;
      await db.rpc("mark_subscriber_event", {
        p_event_id: event.id,
        p_status: "completed",
        p_eligible: eligible,
        p_intent_count: intents,
      } as never);
    } catch (err) {
      // Leave the event recoverable: set back to pending so a later pass retries.
      await db.rpc("mark_subscriber_event", {
        p_event_id: event.id,
        p_status: "pending",
        p_eligible: null,
        p_intent_count: null,
      } as never);
      console.error("[subscribers] fan-out failed", {
        eventId: event.id,
        error: err instanceof Error ? err.message : "unknown",
        trace: randomUUID().slice(0, 8),
      });
    }
  }

  return { events: events.length, intents: totalIntents };
}
