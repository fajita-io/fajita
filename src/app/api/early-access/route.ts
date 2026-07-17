import { NextResponse } from "next/server";

import { DataFastGoals, trackServerGoal } from "@/lib/analytics";
import { clientKey, EMAIL_PATTERN, rateLimit } from "@/lib/site/rate-limit";
import { insertRow } from "@/lib/supabase/admin-rest";

export const runtime = "nodejs";

/**
 * Early access signup. Validates, rate limits, honeypot-checks, and stores
 * the address (idempotent per email). No cookies, no marketing consent
 * implied beyond the early-access invitation itself.
 */
export async function POST(request: Request) {
  if (!rateLimit(`ea:${clientKey(request)}`, { limit: 5, windowMs: 60_000 })) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: { email?: string; company?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "That did not send correctly. Try again." },
      { status: 400 },
    );
  }

  /* Honeypot: real users never fill the hidden "company" field. */
  if (typeof body.company === "string" && body.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const source =
    typeof body.source === "string" && /^[a-z0-9_-]{1,64}$/.test(body.source)
      ? body.source
      : "signup";

  const stored = await insertRow(
    "early_access_signups",
    { email: email.toLowerCase(), source },
    { onConflict: "email" },
  );

  if (!stored.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "That did not save on our side. Nothing is wrong with your address; try again in a moment.",
      },
      { status: 500 },
    );
  }

  await trackServerGoal({
    name: DataFastGoals.waitlistJoin,
    metadata: { source },
  });

  return NextResponse.json({ ok: true });
}
