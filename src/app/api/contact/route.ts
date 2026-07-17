import { NextResponse } from "next/server";

import { DataFastGoals, trackServerGoal } from "@/lib/analytics";
import { isContactTopicId } from "@/lib/site/site-config";
import { clientKey, EMAIL_PATTERN, rateLimit } from "@/lib/site/rate-limit";
import { insertRow } from "@/lib/supabase/admin-rest";

export const runtime = "nodejs";

/**
 * Contact form delivery: validated, rate-limited, honeypot-checked, and
 * stored server-side. Message content never goes to analytics.
 */
export async function POST(request: Request) {
  if (!rateLimit(`contact:${clientKey(request)}`, { limit: 3, windowMs: 60_000 })) {
    return NextResponse.json(
      { ok: false, error: "Too many messages at once. Wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: {
    topic?: string;
    name?: string;
    email?: string;
    message?: string;
    company?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "That did not send correctly. Try again." },
      { status: 400 },
    );
  }

  if (typeof body.company === "string" && body.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const topic = typeof body.topic === "string" ? body.topic : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!isContactTopicId(topic)) {
    return NextResponse.json(
      { ok: false, error: "Choose a topic for the message." },
      { status: 400 },
    );
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid email address so we can reply." },
      { status: 400 },
    );
  }
  if (message.length < 10 || message.length > 5000) {
    return NextResponse.json(
      { ok: false, error: "Say a little more. Messages need at least 10 characters." },
      { status: 400 },
    );
  }

  const stored = await insertRow("contact_messages", {
    topic,
    name,
    email,
    message,
  });

  if (!stored.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "That did not save on our side. Your message is still in the form; try again in a moment.",
      },
      { status: 500 },
    );
  }

  await trackServerGoal({
    name: DataFastGoals.contactSubmitted,
    metadata: { topic },
  });

  return NextResponse.json({ ok: true });
}
