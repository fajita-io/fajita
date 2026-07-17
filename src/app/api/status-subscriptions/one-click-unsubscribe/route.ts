import { NextResponse } from "next/server";

import { unsubscribeByToken } from "@/lib/subscribers/lifecycle";

/**
 * RFC 8058 one-click unsubscribe endpoint. Mail clients POST here when the user
 * taps the native unsubscribe control (List-Unsubscribe-Post header points at
 * this URL). Idempotent, login-free, no redirect dependency, no marketing
 * confirmation. The token is a signed preference token (never a raw subscriber
 * id), validated by HMAC and link version inside unsubscribeByToken.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = new URL(request.url);
  let token = url.searchParams.get("token") ?? "";

  // Some clients send the parameters as a form body instead of the query.
  if (!token) {
    try {
      const form = await request.formData();
      token = String(form.get("token") ?? "");
    } catch {
      // ignore: fall through to the empty-token guard
    }
  }

  if (!token) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await unsubscribeByToken(token, "one_click");
  // Always 200 on a validly formed request: unsubscribe is idempotent and the
  // provider only needs a success signal, never subscriber state.
  return NextResponse.json({ ok: true });
}
