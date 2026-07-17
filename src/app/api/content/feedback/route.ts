import { NextResponse } from "next/server";

/**
 * Content feedback intake. Sanitized, rate-limit friendly shape.
 * Does not publish feedback. Does not store secrets intentionally pasted.
 */

const recent = new Map<string, number>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const last = recent.get(ip) ?? 0;
  if (now - last < 5000) return true;
  recent.set(ip, now);
  return false;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const contentType = String(record.contentType ?? "");
  const slug = String(record.slug ?? "").slice(0, 120);
  const useful = record.useful === "yes" || record.useful === "no" ? record.useful : null;
  if (!contentType || !slug || !useful) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Persist nowhere yet beyond acknowledging. Phase 17 ops can wire storage.
  return NextResponse.json({ ok: true });
}
