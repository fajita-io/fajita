import "server-only";

import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import { lookup as dnsLookup } from "node:dns";

import { isBlockedIp, isMetadataIp, validateUrl } from "@/lib/monitoring/destination";

/**
 * SSRF-safe outbound POST for alert delivery.
 *
 * Same defenses the Phase 4 monitor path applies, at send time rather than only
 * preflight:
 *   - URL hygiene, HTTPS only, no embedded credentials (validateUrl).
 *   - A custom DNS lookup that rejects private, loopback, link-local, and cloud
 *     metadata addresses, and pins the socket to the exact resolved address so
 *     a DNS entry cannot be re-resolved to a blocked host between check and
 *     connect (TOCTOU).
 *   - Redirects are never followed; a 3xx is surfaced as a blocked outcome.
 *   - A hard timeout and a bounded response read (headers/status only; the body
 *     is drained and discarded, never stored).
 */

export interface SafePostResult {
  ok: boolean;
  status: number | null;
  requestId: string | null;
  /** Set when the request could not even be attempted safely. */
  blockedReason: string | null;
  durationMs: number;
}

const MAX_BODY_BYTES = 64 * 1024; // Drain cap; we never keep the body.

/** DNS lookup that only ever yields a permitted public address. */
function guardedLookup(
  hostname: string,
  options: unknown,
  callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void,
): void {
  if (isIP(hostname)) {
    if (isBlockedIp(hostname) || isMetadataIp(hostname)) {
      callback(new Error("blocked_destination"), "", 0);
      return;
    }
    callback(null, hostname, isIP(hostname));
    return;
  }
  dnsLookup(hostname, { all: true }, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      callback(err ?? new Error("blocked_destination"), "", 0);
      return;
    }
    const allowed = addresses.find((a) => !isBlockedIp(a.address) && !isMetadataIp(a.address));
    if (!allowed) {
      callback(new Error("blocked_destination"), "", 0);
      return;
    }
    callback(null, allowed.address, allowed.family);
  });
}

export async function safePost(params: {
  url: string;
  body: string;
  headers?: Record<string, string>;
  timeoutMs: number;
  requestIdHeader?: string; // provider header carrying a request id, if any
}): Promise<SafePostResult> {
  const started = Date.now();
  const v = validateUrl(params.url);
  if (!v.ok) {
    return { ok: false, status: null, requestId: null, blockedReason: v.reason, durationMs: Date.now() - started };
  }
  if (v.scheme !== "https") {
    return { ok: false, status: null, requestId: null, blockedReason: "unsupported_scheme", durationMs: Date.now() - started };
  }

  const u = new URL(v.normalized);
  const payload = Buffer.from(params.body, "utf8");

  return await new Promise<SafePostResult>((resolve) => {
    let settled = false;
    const done = (r: SafePostResult) => {
      if (settled) return;
      settled = true;
      resolve(r);
    };

    const req = httpsRequest(
      {
        protocol: "https:",
        hostname: u.hostname,
        port: u.port ? Number(u.port) : 443,
        path: `${u.pathname}${u.search}`,
        method: "POST",
        lookup: guardedLookup as never,
        headers: {
          "content-type": "application/json",
          "content-length": String(payload.byteLength),
          "user-agent": "Fajita-Alerts/1.0",
          accept: "application/json, text/plain;q=0.9, */*;q=0.5",
          ...params.headers,
        },
        timeout: params.timeoutMs,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const requestId = params.requestIdHeader
          ? (res.headers[params.requestIdHeader.toLowerCase()] as string | undefined) ?? null
          : null;

        // Never follow redirects; a webhook that 3xx-es is misconfigured or
        // an SSRF attempt to reach an internal location.
        if (status >= 300 && status < 400) {
          res.destroy();
          done({ ok: false, status, requestId, blockedReason: "redirect_not_allowed", durationMs: Date.now() - started });
          return;
        }

        let read = 0;
        res.on("data", (chunk: Buffer) => {
          read += chunk.length;
          if (read > MAX_BODY_BYTES) res.destroy();
        });
        res.on("end", () => {
          done({ ok: status >= 200 && status < 300, status, requestId, blockedReason: null, durationMs: Date.now() - started });
        });
        res.on("error", () => {
          done({ ok: status >= 200 && status < 300, status, requestId, blockedReason: null, durationMs: Date.now() - started });
        });
      },
    );

    req.on("timeout", () => {
      req.destroy();
      done({ ok: false, status: null, requestId: null, blockedReason: "timeout", durationMs: Date.now() - started });
    });
    req.on("error", (err: NodeJS.ErrnoException) => {
      const reason = err.message === "blocked_destination" ? "blocked_destination" : "network_error";
      done({ ok: false, status: null, requestId: null, blockedReason: reason, durationMs: Date.now() - started });
    });

    req.write(payload);
    req.end();
  });
}
