/**
 * Client-side HMAC SHA-256 webhook signature helpers.
 * Secrets and payloads must never be sent to the server.
 */

export type SignatureMode = "generate" | "verify";

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export function buildSignedMessage(timestamp: string, rawBody: string): string {
  return `${timestamp}.${rawBody}`;
}

export async function hmacSha256Hex(
  secret: string,
  message: string,
): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto is required for HMAC SHA-256 in this browser.");
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toHex(sig);
}

export async function generateWebhookSignature(input: {
  secret: string;
  rawBody: string;
  timestamp: string;
}): Promise<{ signature: string; signedMessage: string }> {
  const signedMessage = buildSignedMessage(input.timestamp, input.rawBody);
  const signature = await hmacSha256Hex(input.secret, signedMessage);
  return { signature, signedMessage };
}

export async function verifyWebhookSignature(input: {
  secret: string;
  rawBody: string;
  timestamp: string;
  signature: string;
}): Promise<{ valid: boolean; expected: string; signedMessage: string }> {
  const { signature, signedMessage } = await generateWebhookSignature(input);
  const provided = input.signature.trim().toLowerCase().replace(/^sha256=/, "");
  const expected = signature.toLowerCase();
  return {
    valid: timingSafeEqual(provided, expected),
    expected,
    signedMessage,
  };
}
