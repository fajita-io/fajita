/**
 * Email normalization and validation for subscribers. Pure, no server deps, so
 * it is unit-testable and reusable on the edge of the public form.
 *
 * Deliberately conservative: we lowercase the domain and trim whitespace, but
 * we do NOT alter the local part beyond a full lowercase, do NOT strip Gmail
 * dots or plus-aliases, and do NOT assume provider mailbox equivalence. When a
 * domain looks like a common typo we SUGGEST a correction; we never silently
 * rewrite the address the person typed.
 */

// Local part is left as typed except for a single lowercase pass. Full
// lowercasing is a documented normalization choice: it keeps duplicate
// detection stable and matches how the overwhelming majority of mail providers
// treat mailboxes, while never dropping dots or plus tags.
export function normalizeEmail(input: string): string {
  const trimmed = input.trim();
  const at = trimmed.lastIndexOf("@");
  if (at < 1) return trimmed.toLowerCase();
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1).toLowerCase();
  return `${local.toLowerCase()}@${domain}`;
}

// Practical, not RFC-exhaustive: one @, non-empty local, a dotted domain with a
// 2+ char TLD, no whitespace. Good enough to reject obvious garbage without
// blocking valid internationalized domains that already resolve to punycode.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(normalized: string): boolean {
  if (normalized.length > 254) return false;
  return EMAIL_RE.test(normalized);
}

// Common domain typos worth suggesting. Kept small and specific; expanding this
// into fuzzy matching risks false positives, so we only correct near-certain
// slips of a well-known domain.
const DOMAIN_SUGGESTIONS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gnail.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "outlok.com": "outlook.com",
  "outllook.com": "outlook.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "iclod.com": "icloud.com",
  "icloud.co": "icloud.com",
  "proton.me ": "proton.me",
};

/**
 * Suggest a corrected address when the domain matches a known typo. Returns
 * null when nothing looks wrong. The caller must have the user accept the
 * suggestion; it is never applied automatically.
 */
export function suggestCorrection(normalized: string): string | null {
  const at = normalized.lastIndexOf("@");
  if (at < 1) return null;
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  const fixed = DOMAIN_SUGGESTIONS[domain];
  if (!fixed || fixed === domain) return null;
  return `${local}@${fixed}`;
}
