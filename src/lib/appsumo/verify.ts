import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { appsumoLicensingKey } from "@/lib/appsumo/config";

/**
 * Verify AppSumo webhook HMAC SHA256 signature.
 * Returns true when valid, false when invalid, null when verification is skipped
 * (no API key configured).
 */
export function verifyAppsumoWebhookSignature(args: {
  rawBody: string;
  signature: string | null;
  timestamp: string | null;
}): boolean | null {
  const secret = appsumoLicensingKey();
  if (!secret) return null;
  if (!args.signature || !args.timestamp) return false;

  const payload = `${args.timestamp}${args.rawBody}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(args.signature, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
