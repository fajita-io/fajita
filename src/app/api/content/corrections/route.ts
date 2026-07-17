import { NextResponse } from "next/server";

const recent = new Map<string, number>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const last = recent.get(ip) ?? 0;
  if (now - last < 10000) return true;
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
  const slug = String(record.slug ?? "").slice(0, 120);
  const claim = String(record.claim ?? "").slice(0, 400);
  const correction = String(record.correction ?? "").slice(0, 800);
  const source = String(record.source ?? "").slice(0, 400);

  if (!slug || !claim || !correction || !source) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!/^https:\/\//i.test(source)) {
    return NextResponse.json(
      { ok: false, error: "Source must be an https URL." },
      { status: 400 },
    );
  }

  // Accepted for internal review. Not auto-published.
  return NextResponse.json({ ok: true, status: "received" });
}
