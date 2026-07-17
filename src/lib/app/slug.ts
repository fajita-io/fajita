/**
 * Organization slug rules. Slugs are URL-safe handles, distinct from the
 * permanent internal uuid. They are normalized, validated, and reserved-word
 * protected. Never used as the sole tenant identifier.
 */

/** Routes and words a slug must not shadow. */
export const RESERVED_SLUGS = new Set([
  "app",
  "api",
  "auth",
  "login",
  "signup",
  "logout",
  "admin",
  "internal",
  "settings",
  "team",
  "billing",
  "new",
  "onboarding",
  "overview",
  "monitors",
  "incidents",
  "status",
  "status-pages",
  "integrations",
  "support",
  "help",
  "www",
  "fajita",
  "static",
  "assets",
  "public",
]);

export const SLUG_MIN = 3;
export const SLUG_MAX = 32;

/** Lowercase, strip accents, collapse to `a-z0-9-`, trim dashes. */
export function normalizeSlug(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX);
}

export type SlugValidation =
  | { ok: true; slug: string }
  | { ok: false; reason: string };

export function validateSlug(input: string): SlugValidation {
  const slug = normalizeSlug(input);
  if (slug.length < SLUG_MIN) {
    return { ok: false, reason: `Use at least ${SLUG_MIN} characters.` };
  }
  if (slug.length > SLUG_MAX) {
    return { ok: false, reason: `Keep it under ${SLUG_MAX} characters.` };
  }
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
    return { ok: false, reason: "Use letters, numbers, and hyphens only." };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { ok: false, reason: "That name is reserved. Try another." };
  }
  return { ok: true, slug };
}

/** Suggest a slug from an organization name, with a short random suffix option. */
export function suggestSlug(name: string): string {
  const base = normalizeSlug(name) || "team";
  return base.length < SLUG_MIN ? `${base}-team`.slice(0, SLUG_MAX) : base;
}
