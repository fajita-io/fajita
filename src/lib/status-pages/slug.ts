/**
 * Slug and hosted-subdomain rules for status pages. The page slug doubles as
 * the hosted subdomain label (customer.status.fajita.io), so it is validated
 * against DNS label rules and a reserved-word list, and is globally unique.
 * Client-safe.
 */

import { normalizeSlug } from "@/lib/app/slug";
import { RESERVED_SUBDOMAINS } from "./constants";

export const SUBDOMAIN_MIN = 3;
export const SUBDOMAIN_MAX = 40;

export type SubdomainValidation =
  | { ok: true; slug: string }
  | { ok: false; reason: string };

/** Validate a hosted subdomain / page slug candidate. */
export function validateSubdomain(input: string): SubdomainValidation {
  const slug = normalizeSlug(input).slice(0, SUBDOMAIN_MAX);
  if (slug.length < SUBDOMAIN_MIN) {
    return { ok: false, reason: `Use at least ${SUBDOMAIN_MIN} characters.` };
  }
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/.test(slug)) {
    return {
      ok: false,
      reason: "Use lowercase letters, numbers, and hyphens only.",
    };
  }
  if (RESERVED_SUBDOMAINS.has(slug)) {
    return { ok: false, reason: "That address is reserved. Try another." };
  }
  // Block patterns that could impersonate the platform.
  if (slug.startsWith("fajita")) {
    return { ok: false, reason: "That address is reserved. Try another." };
  }
  if (slug.includes("--")) {
    return { ok: false, reason: "Use lowercase letters, numbers, and hyphens only." };
  }
  return { ok: true, slug };
}

export function suggestSubdomain(name: string): string {
  let candidate = normalizeSlug(name) || "status";
  if (RESERVED_SUBDOMAINS.has(candidate)) {
    candidate = `${candidate}-status`;
  }
  // "Fajita Status" normalizes to fajita-status, which is blocked as
  // impersonation. Strip the brand prefix so the form does not prefill
  // an address it will immediately reject.
  if (candidate.startsWith("fajita")) {
    const stripped = candidate.replace(/^fajita-?/, "");
    candidate = stripped.length >= SUBDOMAIN_MIN ? stripped : "status-page";
    if (RESERVED_SUBDOMAINS.has(candidate) || candidate.startsWith("fajita")) {
      candidate = candidate === "status" ? "status-page" : `${candidate}-page`;
    }
  }
  if (candidate.length < SUBDOMAIN_MIN) {
    candidate = `${candidate}-page`;
  }
  return candidate.slice(0, SUBDOMAIN_MAX);
}

/** Component slug: shorter, single-label, used for on-page anchors. */
export function componentSlug(name: string): string {
  const base = normalizeSlug(name).slice(0, 48) || "component";
  return base;
}

/** Deterministic incident public slug from a reference code + title. */
export function incidentPublicSlug(reference: string, title: string): string {
  const base = normalizeSlug(`${reference}-${title}`).slice(0, 60);
  return base || normalizeSlug(reference) || "incident";
}
