import "server-only";

import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

import { ALLOWED_PORTS, ALLOWED_SCHEMES } from "@contracts/contract";

/**
 * Application-layer destination validation for the server-side pre-save test
 * path (see docs/security/monitoring-ssrf-defense.md). This mirrors the Go
 * worker's rules so the internal test gate applies the same SSRF, scheme, and
 * port defenses the scheduled worker applies. The Go worker remains the
 * execution authority for scheduled checks; this module never runs continuous
 * monitoring.
 *
 * It intentionally does not open connections. It validates URL hygiene and,
 * for the preflight, resolves the host and confirms every resolved address is
 * permitted, so a destination that only resolves to a blocked range is rejected
 * before any request is attempted.
 */

export type DestinationBlockReason =
  | "unsupported_scheme"
  | "blocked_port"
  | "invalid_url"
  | "embedded_credentials"
  | "blocked_destination";

export interface DestinationOk {
  ok: true;
  scheme: string;
  host: string;
  port: number;
  normalized: string;
}

export interface DestinationBlocked {
  ok: false;
  reason: DestinationBlockReason;
  message: string;
}

export type DestinationResult = DestinationOk | DestinationBlocked;

const MAX_URL_LENGTH = 2048;

function blocked(
  reason: DestinationBlockReason,
  message: string,
): DestinationBlocked {
  return { ok: false, reason, message };
}

/** Validate URL hygiene, scheme, and port. Does not resolve DNS. */
export function validateUrl(raw: string): DestinationResult {
  if (!raw) return blocked("invalid_url", "The URL is empty.");
  if (raw.length > MAX_URL_LENGTH) {
    return blocked("invalid_url", "The URL is too long.");
  }
  // Control characters, whitespace, null bytes.
  if (/[\x00-\x20\x7f]/.test(raw)) {
    return blocked("invalid_url", "The URL contains invalid characters.");
  }

  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return blocked("invalid_url", "The URL could not be parsed.");
  }

  const scheme = u.protocol.replace(/:$/, "").toLowerCase();
  if (!ALLOWED_SCHEMES.includes(scheme as (typeof ALLOWED_SCHEMES)[number])) {
    return blocked("unsupported_scheme", `The ${scheme} scheme is not allowed.`);
  }
  if (u.username || u.password) {
    return blocked(
      "embedded_credentials",
      "The URL must not contain embedded credentials.",
    );
  }

  const host = u.hostname;
  if (!host) return blocked("invalid_url", "The URL has no host.");
  if (host.includes("..") || host.startsWith(".")) {
    return blocked("invalid_url", "The host is ambiguous.");
  }

  const port = u.port
    ? Number.parseInt(u.port, 10)
    : scheme === "https"
      ? 443
      : 80;
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    return blocked("invalid_url", "The port is invalid.");
  }
  if (!ALLOWED_PORTS.includes(port as (typeof ALLOWED_PORTS)[number])) {
    return blocked("blocked_port", `Port ${port} is not permitted.`);
  }

  return {
    ok: true,
    scheme,
    host,
    port,
    normalized: `${scheme}://${u.host}${u.pathname}${u.search}`,
  };
}

/** Parse an IPv4 dotted string to a 32-bit number, or null. */
function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const b = Number(p);
    if (!Number.isInteger(b) || b < 0 || b > 255) return null;
    n = (n << 8) | b;
  }
  return n >>> 0;
}

function inV4Cidr(ip: string, base: string, bits: number): boolean {
  const a = ipv4ToInt(ip);
  const b = ipv4ToInt(base);
  if (a === null || b === null) return false;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (a & mask) === (b & mask);
}

const BLOCKED_V4_CIDRS: Array<[string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
  ["255.255.255.255", 32],
];

const METADATA_IPS = new Set(["169.254.169.254", "100.100.100.200"]);

/** Is this resolved IP address blocked (private/reserved/metadata)? */
export function isBlockedIp(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) {
    return BLOCKED_V4_CIDRS.some(([b, bits]) => inV4Cidr(ip, b, bits));
  }
  if (family === 6) {
    const lower = ip.toLowerCase();
    // IPv4-mapped: ::ffff:a.b.c.d -> evaluate the embedded v4.
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedIp(mapped[1]);
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fe80") || lower.startsWith("fc") || lower.startsWith("fd"))
      return true;
    if (lower.startsWith("ff")) return true; // multicast
    if (lower.startsWith("2001:db8")) return true; // documentation
    if (lower.startsWith("64:ff9b")) return true; // NAT64
    return false;
  }
  // Not a literal IP: caller must resolve first.
  return true;
}

export function isMetadataIp(ip: string): boolean {
  return METADATA_IPS.has(ip);
}

export interface PreflightResult {
  ok: boolean;
  reason?: DestinationBlockReason;
  message?: string;
  isMetadata?: boolean;
}

/**
 * Full preflight: validate the URL, then resolve the host and confirm at least
 * one resolved address is permitted. Rejects hosts that resolve only to blocked
 * ranges. This is the SSRF gate for the internal test path.
 */
export async function preflightDestination(raw: string): Promise<PreflightResult> {
  const v = validateUrl(raw);
  if (!v.ok) {
    return { ok: false, reason: v.reason, message: v.message };
  }

  // If the host is a literal IP, evaluate it directly.
  if (isIP(v.host)) {
    if (isBlockedIp(v.host)) {
      return {
        ok: false,
        reason: "blocked_destination",
        message: "The destination address is not permitted.",
        isMetadata: isMetadataIp(v.host),
      };
    }
    return { ok: true };
  }

  let addrs: Array<{ address: string }>; 
  try {
    addrs = await lookup(v.host, { all: true });
  } catch {
    return {
      ok: false,
      reason: "blocked_destination",
      message: "The hostname could not be resolved.",
    };
  }
  if (addrs.length === 0) {
    return {
      ok: false,
      reason: "blocked_destination",
      message: "The hostname did not resolve to any address.",
    };
  }
  const anyMetadata = addrs.some((a) => isMetadataIp(a.address));
  const allowed = addrs.filter((a) => !isBlockedIp(a.address));
  if (allowed.length === 0) {
    return {
      ok: false,
      reason: "blocked_destination",
      message: "The destination resolves only to blocked addresses.",
      isMetadata: anyMetadata,
    };
  }
  return { ok: true };
}
