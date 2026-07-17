/**
 * Approved referral destinations.
 *
 * Affiliate links may only point at a fixed allowlist of public marketing paths.
 * This is the open-redirect defense: a referral request can never be coerced
 * into sending a visitor to an arbitrary external URL, a JavaScript URL, a
 * private application route, a checkout session, or a consent-bypassing page.
 *
 * Pure and dependency-free.
 */

/** Public marketing paths an affiliate may link to. Extend only deliberately. */
export const APPROVED_DESTINATIONS = [
  "/",
  "/pricing",
  "/features",
  "/features/uptime-monitoring",
  "/features/api-monitoring",
  "/features/ssl-monitoring",
  "/features/cron-monitoring",
  "/features/status-pages",
  "/features/incident-communication",
  "/integrations",
  "/security",
  "/affiliates",
] as const;

export type ApprovedDestination = (typeof APPROVED_DESTINATIONS)[number];

export const DEFAULT_DESTINATION: ApprovedDestination = "/";

/**
 * Normalize and validate a requested destination. Returns an approved absolute
 * path or null when the input is unsafe or not on the allowlist.
 *
 * Rules:
 *   - Must be a same-origin relative path beginning with a single "/".
 *   - No protocol-relative ("//host") or scheme ("javascript:", "http:") input.
 *   - No backslashes, no control characters, no whitespace.
 *   - Query and hash are stripped; only the path is honored against the
 *     allowlist. Campaign parameters are carried separately, never in the raw
 *     destination.
 */
export function resolveDestination(input: string | null | undefined): ApprovedDestination | null {
  if (!input) return DEFAULT_DESTINATION;
  const raw = input.trim();
  if (raw.length === 0) return DEFAULT_DESTINATION;
  if (raw.length > 512) return null;

  // Reject anything that is not a clean relative path.
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  if (raw.includes("\\")) return null;
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;
  if (/\s/.test(raw)) return null;
  // Reject an embedded scheme delimiter that some parsers would treat as
  // absolute (e.g. "/\t/evil" already rejected; "/:" defensive).
  if (raw.includes(":")) return null;

  const path = raw.split("#")[0].split("?")[0];
  const normalized = path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;

  return (APPROVED_DESTINATIONS as readonly string[]).includes(normalized)
    ? (normalized as ApprovedDestination)
    : null;
}

export function isApprovedDestination(input: string): input is ApprovedDestination {
  return resolveDestination(input) === input;
}
