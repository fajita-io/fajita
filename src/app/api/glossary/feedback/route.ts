import { NextResponse } from "next/server";

import { recordGlossaryFeedback } from "@/lib/glossary/feedback";
import { getTerm } from "@/lib/glossary/registry";

const bucket = new Map<string, { count: number; reset: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = bucket.get(ip);
  if (!entry || entry.reset < now) {
    bucket.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: {
    slug?: string;
    helpful?: boolean;
    reason?: string;
    comment?: string;
    contentVersion?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.slug || typeof body.helpful !== "boolean" || !body.contentVersion) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const term = getTerm(body.slug);
  if (!term || term.meta.status !== "published") {
    return NextResponse.json({ error: "unknown_term" }, { status: 400 });
  }

  try {
    await recordGlossaryFeedback({
      slug: body.slug,
      helpful: body.helpful,
      reason: body.reason,
      comment: body.comment,
      contentVersion: body.contentVersion,
    });
  } catch {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
