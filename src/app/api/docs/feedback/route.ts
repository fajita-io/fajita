import { z } from "zod";

import { DOCS_VERSION } from "@/lib/docs/frontmatter";
import { recordFeedback } from "@/lib/docs/feedback";
import { getDoc } from "@/lib/docs/registry";

/**
 * Anonymous documentation feedback. No login required. Rate limited per
 * process to blunt abuse, validated with zod, and sanitized before storage.
 * The endpoint never trusts the client for the docs version and only accepts
 * feedback for a real page.
 */
const schema = z.object({
  slug: z.string().min(1).max(200),
  helpful: z.boolean(),
  reason: z.string().max(40).optional(),
  comment: z.string().max(500).optional(),
  docsVersion: z.string().max(40).optional(),
});

// Best-effort in-memory rate limit (per instance). Not a security control by
// itself; abusive volume is also bounded at the edge.
const HITS = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

function limited(key: string): boolean {
  const now = Date.now();
  const entry = HITS.get(key);
  if (!entry || now > entry.resetAt) {
    HITS.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ipKey =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  if (limited(ipKey)) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const page = getDoc(parsed.data.slug);
  if (!page) {
    return Response.json({ ok: false, error: "unknown_page" }, { status: 404 });
  }

  try {
    await recordFeedback({
      slug: page.meta.slug,
      helpful: parsed.data.helpful,
      reason: parsed.data.reason,
      comment: parsed.data.comment,
      docsVersion: page.meta.docsVersion || DOCS_VERSION,
      productVersion: page.meta.productVersion,
    });
  } catch {
    // Never surface storage detail to the client.
    return Response.json({ ok: true });
  }

  return Response.json({ ok: true });
}
