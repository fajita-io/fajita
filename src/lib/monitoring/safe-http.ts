import http from "node:http";
import https from "node:https";
import { lookup as dnsLookup, type LookupOptions } from "node:dns";
import { isIP } from "node:net";

import { isBlockedIp, validateUrl } from "@/lib/monitoring/destination";

export class SafeHttpBlockedError extends Error {
  readonly code = "EBLOCKED" as const;
  constructor(message = "The destination address is not permitted.") {
    super(message);
    this.name = "SafeHttpBlockedError";
  }
}

/** DNS-rebinding-safe lookup: resolve and validate immediately before connect. */
function validatedLookup(
  hostname: string,
  options: LookupOptions,
  callback: (
    err: NodeJS.ErrnoException | null,
    address: string,
    family: number,
  ) => void,
): void {
  void (async () => {
    try {
      if (isIP(hostname)) {
        if (isBlockedIp(hostname)) {
          callback(new SafeHttpBlockedError() as NodeJS.ErrnoException, "", 0);
          return;
        }
        callback(null, hostname, isIP(hostname) === 6 ? 6 : 4);
        return;
      }

      const addrs = await new Promise<
        Array<{ address: string; family: number }>
      >((resolve, reject) => {
        dnsLookup(hostname, { ...options, all: true }, (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses ?? []);
        });
      });

      const allowed = addrs.filter((a) => !isBlockedIp(a.address));
      if (allowed.length === 0) {
        callback(new SafeHttpBlockedError() as NodeJS.ErrnoException, "", 0);
        return;
      }

      const pick = allowed[0];
      callback(null, pick.address, pick.family);
    } catch (error) {
      callback(error as NodeJS.ErrnoException, "", 0);
    }
  })();
}

export interface SafeHttpResponse {
  status: number;
  headers: Headers;
  url: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

/**
 * Outbound HTTP(S) for monitor cron execution. Uses a custom lookup so resolved
 * IPs are validated at connection time (DNS rebinding defense aligned with the Go
 * worker dialer). Does not follow redirects; callers validate each hop.
 */
export function safeMonitorFetch(
  rawUrl: string,
  init: {
    method?: string;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  } = {},
): Promise<SafeHttpResponse> {
  const validated = validateUrl(rawUrl);
  if (!validated.ok) {
    return Promise.reject(new Error(validated.message ?? "Invalid URL."));
  }

  const isHttps = validated.scheme === "https";
  const lib = isHttps ? https : http;
  const agent = isHttps
    ? new https.Agent({ lookup: validatedLookup, keepAlive: false })
    : new http.Agent({ lookup: validatedLookup, keepAlive: false });

  const target = new URL(validated.normalized);

  if (isIP(target.hostname) && isBlockedIp(target.hostname)) {
    return Promise.reject(new SafeHttpBlockedError());
  }

  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || (isHttps ? 443 : 80),
        path: `${target.pathname}${target.search}`,
        method: init.method ?? "GET",
        headers: init.headers,
        agent,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("error", reject);
        res.on("end", () => {
          const body = Buffer.concat(chunks);
          const headers = new Headers();
          for (const [key, value] of Object.entries(res.headers)) {
            if (value === undefined) continue;
            headers.set(key, Array.isArray(value) ? value.join(", ") : value);
          }
          resolve({
            status: res.statusCode ?? 0,
            headers,
            url: validated.normalized,
            arrayBuffer: async () => {
              const ab = new ArrayBuffer(body.byteLength);
              new Uint8Array(ab).set(body);
              return ab;
            },
          });
        });
      },
    );

    req.on("error", (error) => {
      if (error instanceof SafeHttpBlockedError) {
        reject(error);
        return;
      }
      reject(error);
    });

    if (init.signal) {
      if (init.signal.aborted) {
        req.destroy();
        reject(new Error("Aborted"));
        return;
      }
      init.signal.addEventListener(
        "abort",
        () => {
          req.destroy();
          reject(new Error("Aborted"));
        },
        { once: true },
      );
    }

    req.end();
  });
}
