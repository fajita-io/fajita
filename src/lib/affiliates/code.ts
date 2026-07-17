/**
 * Affiliate code normalization and validation.
 *
 * Codes appear in public URLs (fajita.io/?ref=alex). They must be stable,
 * unique, case-insensitive, and safe: no reserved words, no impersonation of
 * Fajita or its surfaces, no profanity, no email addresses, no sensitive data,
 * and never a raw database id.
 *
 * Pure and dependency-free.
 */

/** Lowercase, trim, collapse to the canonical comparison form. */
export function normalizeCode(input: string): string {
  return input.trim().toLowerCase();
}

const CODE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;

/**
 * Reserved words that could impersonate Fajita, collide with routing, or mislead
 * visitors. Compared against the normalized code.
 */
export const RESERVED_CODES: ReadonlySet<string> = new Set([
  "fajita",
  "fajitaio",
  "official",
  "officialfajita",
  "support",
  "admin",
  "administrator",
  "billing",
  "security",
  "status",
  "app",
  "api",
  "internal",
  "affiliate",
  "affiliates",
  "partner",
  "partners",
  "team",
  "help",
  "sales",
  "login",
  "signin",
  "signup",
  "pricing",
  "docs",
  "blog",
  "root",
  "system",
  "null",
  "undefined",
  "test",
]);

/** Minimal profanity guard. Real deployments extend this list server-side. */
const PROFANITY_FRAGMENTS: readonly string[] = [
  "fuck",
  "shit",
  "cunt",
  "nigger",
  "faggot",
  "rape",
];

export type CodeRejectionReason =
  | "too_short"
  | "too_long"
  | "invalid_characters"
  | "reserved"
  | "impersonation"
  | "profanity"
  | "looks_like_email";

export interface CodeValidationResult {
  ok: boolean;
  normalized: string;
  reason?: CodeRejectionReason;
}

/**
 * Validate a requested affiliate code. Returns the normalized form and, on
 * failure, a machine reason (mapped to friendly copy at the UI layer).
 */
export function validateCode(input: string): CodeValidationResult {
  const normalized = normalizeCode(input);

  if (normalized.length < 3) return { ok: false, normalized, reason: "too_short" };
  if (normalized.length > 32) return { ok: false, normalized, reason: "too_long" };
  if (normalized.includes("@")) {
    return { ok: false, normalized, reason: "looks_like_email" };
  }
  if (!CODE_PATTERN.test(normalized)) {
    return { ok: false, normalized, reason: "invalid_characters" };
  }
  if (RESERVED_CODES.has(normalized)) {
    return { ok: false, normalized, reason: "reserved" };
  }
  // Impersonation: contains the brand adjacent to trust words.
  if (normalized.includes("fajita")) {
    return { ok: false, normalized, reason: "impersonation" };
  }
  if (PROFANITY_FRAGMENTS.some((frag) => normalized.includes(frag))) {
    return { ok: false, normalized, reason: "profanity" };
  }

  return { ok: true, normalized };
}

const CODE_REJECTION_MESSAGES: Record<CodeRejectionReason, string> = {
  too_short: "Codes need at least 3 characters.",
  too_long: "Keep codes to 32 characters or fewer.",
  invalid_characters: "Use letters, numbers, and hyphens only.",
  reserved: "That code is reserved. Try another.",
  impersonation: "That code is not allowed. Try another.",
  profanity: "That code is not allowed. Try another.",
  looks_like_email: "A code cannot look like an email address.",
};

/** Friendly, user-safe copy for a code rejection reason. */
export function codeRejectionMessage(reason: CodeRejectionReason): string {
  return CODE_REJECTION_MESSAGES[reason];
}

/**
 * Derive a suggested default code from a display name or email local part. The
 * caller still checks uniqueness and appends a discriminator on collision.
 */
export function suggestCodeFromName(name: string): string {
  const base = normalizeCode(name)
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  if (base.length >= 3 && CODE_PATTERN.test(base) && !RESERVED_CODES.has(base) && !base.includes("fajita")) {
    return base;
  }
  return "";
}
