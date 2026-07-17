import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth/context";
import { answerSupportQuestion } from "@/lib/support/decision-engine";
import { getPamphletHealth } from "@/lib/pamphlet/health";
import { serviceClient } from "@/lib/supabase/service";

const bodySchema = z.object({
  message: z.string().min(1).max(4000),
  mode: z.enum(["public", "authenticated"]),
  pageContext: z
    .object({
      route: z.string().max(200),
      productArea: z.string().max(80).optional(),
      pageTitle: z.string().max(120).optional(),
      selectedTab: z.string().max(80).optional(),
      helpTopic: z.string().max(80).optional(),
      resourceRef: z
        .object({
          kind: z.enum(["monitor", "incident", "status_page", "alert_channel"]),
          id: z.string().uuid(),
        })
        .optional(),
    })
    .optional(),
  conversationId: z.string().uuid().optional(),
});

const RATE = new Map<string, { count: number; reset: number }>();

function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = RATE.get(key);
  if (!entry || entry.reset < now) {
    RATE.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid support request." },
      { status: 400 },
    );
  }

  const profile = await getCurrentProfile().catch(() => null);
  const mode =
    parsed.data.mode === "authenticated" && profile
      ? ("authenticated" as const)
      : ("public" as const);

  if (parsed.data.mode === "authenticated" && !profile) {
    return NextResponse.json(
      { ok: false, error: "Sign in to use authenticated support." },
      { status: 401 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rlKey = profile?.id ?? ip;
  if (!rateLimit(rlKey, profile ? 60 : 20, 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Too many support messages. Try again shortly." },
      { status: 429 },
    );
  }

  const result = await answerSupportQuestion({
    message: parsed.data.message,
    mode,
    pageContext: parsed.data.pageContext,
    userId: profile?.id,
    conversationId: parsed.data.conversationId,
  });

  // Best-effort local metadata. Never store full bodies here.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = serviceClient() as any;
    const { data: conversation } = await db
      .from("support_conversations")
      .insert({
        mode,
        state: result.answer.offerHandoff ? "handoff_offered" : "active",
        user_id: profile?.id ?? null,
        intent: result.answer.intent,
        product_area: result.answer.productArea ?? null,
        title: result.conversationTitle ?? "Support question",
        redaction_state: result.detections.length ? "redacted" : "clean",
        retention_class:
          mode === "public" ? "public_anonymous" : "authenticated_support",
      })
      .select("id")
      .single();

    if (conversation?.id) {
      await db.from("support_messages_metadata").insert([
        {
          conversation_id: conversation.id,
          message_type: "user_message",
          author_type: "user",
          sequence: 1,
          redacted: result.detections.length > 0,
        },
        {
          conversation_id: conversation.id,
          message_type: "automated_answer",
          author_type: "automated",
          sequence: 2,
          redacted: false,
        },
      ]);
      if (result.injectionSuspicious) {
        await db.from("support_safety_events").insert({
          conversation_id: conversation.id,
          event_type: "prompt_injection_attempt",
          severity: "warning",
          metadata: { reasons: ["injection"] },
        });
      }
      for (const detection of result.detections) {
        await db.from("support_redactions").insert({
          conversation_id: conversation.id,
          detection_type: detection,
        });
      }
    }
  } catch {
    // Local persistence must not block answers.
  }

  const health = getPamphletHealth();

  return NextResponse.json({
    ok: true,
    answer: result.answer,
    provider: {
      status: health.status,
      // Honest: answers are local until Pamphlet contract is verified.
      conversationProvider: "local_with_pamphlet_attribution",
    },
  });
}
