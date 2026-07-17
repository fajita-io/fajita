/**
 * Custom-domain normalization and validation. Client-safe (no DB, no DNS).
 * The first version supports subdomains (status.customer.com), not apex
 * domains, because apex hosting needs infrastructure Fajita has not shipped.
 */

const LABEL = "[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?";
const HOSTNAME_RE = new RegExp(`^(?:${LABEL}\\.)+${LABEL}$`);

export type DomainNormalization =
  | { ok: true; domain: string }
  | { ok: false; reason: string };

/**
 * Normalize a customer-entered domain to a bare, lowercase hostname. Rejects
 * protocols, paths, ports, non-ascii (homograph risk), apex domains, and any
 * fajita.io hostname (customers cannot impersonate the platform).
 */
export function normalizeCustomDomain(input: string): DomainNormalization {
  let value = input.trim().toLowerCase();
  if (!value) return { ok: false, reason: "Enter a domain." };

  // Strip scheme, path, query, and any trailing dot.
  value = value.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.$/, "");
  if (value.includes("@")) return { ok: false, reason: "Enter a domain, not an email address." };
  if (value.includes(":")) return { ok: false, reason: "Remove the port from the domain." };
  if (/[^a-z0-9.-]/.test(value)) {
    return {
      ok: false,
      reason: "Use a plain ASCII domain. Internationalized domains must be entered in punycode.",
    };
  }
  if (!HOSTNAME_RE.test(value)) {
    return { ok: false, reason: "That does not look like a valid domain." };
  }

  const labels = value.split(".");
  if (labels.length < 3) {
    return {
      ok: false,
      reason: "Use a subdomain such as status.yourcompany.com. Apex domains are not supported yet.",
    };
  }
  if (value.endsWith("fajita.io") || value === "fajita.io") {
    return { ok: false, reason: "That domain is not available." };
  }
  if (value.length > 253) {
    return { ok: false, reason: "That domain is too long." };
  }
  return { ok: true, domain: value };
}

/**
 * The DNS instructions a customer must follow for a custom domain: a CNAME for
 * routing and a TXT challenge for ownership. Provider-neutral, no promises
 * about propagation time.
 */
export interface DnsInstructions {
  cname: { host: string; type: "CNAME"; value: string };
  txt: { host: string; type: "TXT"; value: string };
}

export function dnsInstructions(
  domain: string,
  cnameTarget: string,
  txtToken: string,
): DnsInstructions {
  return {
    cname: { host: domain, type: "CNAME", value: cnameTarget },
    txt: { host: `_fajita-challenge.${domain}`, type: "TXT", value: `fajita-verify=${txtToken}` },
  };
}
