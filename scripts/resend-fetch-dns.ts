/**
 * Fetch Resend DNS records for fajita.io and write scripts/resend-dns-records.json.
 *
 * Requires a full-access Resend API key (not send-only):
 *   RESEND_FULL_API_KEY=re_... npx tsx scripts/resend-fetch-dns.ts
 *
 * Optional:
 *   RESEND_DOMAIN=fajita.io
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const DOMAIN = process.env.RESEND_DOMAIN ?? "fajita.io";
const API_KEY = process.env.RESEND_FULL_API_KEY ?? process.env.RESEND_ADMIN_API_KEY;

type ResendRecord = {
  record: string;
  name: string;
  type: string;
  ttl: string;
  status: string;
  value: string;
  priority?: number;
};

type ResendDomain = {
  id: string;
  name: string;
  status: string;
  records: ResendRecord[];
};

async function resend<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_KEY) {
    throw new Error(
      "RESEND_FULL_API_KEY is required (full access, not send-only). Create one in Resend Dashboard > API Keys.",
    );
  }

  const res = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = (await res.json()) as T & {
    statusCode?: number;
    message?: string;
    name?: string;
  };

  if (!res.ok) {
    throw new Error(
      `Resend API ${path} failed (${res.status}): ${body.message ?? res.statusText}`,
    );
  }

  return body;
}

function toCloudflareName(recordName: string, domain: string): string {
  const trimmed = recordName.replace(/\.$/, "");
  if (trimmed === domain) return domain;
  if (trimmed.endsWith(`.${domain}`)) {
    return trimmed;
  }
  return `${trimmed}.${domain}`;
}

async function main() {
  const listed = await resend<{ data: ResendDomain[] }>("/domains");
  let domain = listed.data.find((d) => d.name === DOMAIN);

  if (!domain) {
    console.log(`Creating Resend domain ${DOMAIN}...`);
    domain = await resend<ResendDomain>("/domains", {
      method: "POST",
      body: JSON.stringify({ name: DOMAIN }),
    });
  }

  const detail = await resend<ResendDomain>(`/domains/${domain.id}`);
  const records = (detail.records ?? []).map((record) => ({
    type: record.type.toUpperCase(),
    name: toCloudflareName(record.name, DOMAIN),
    content: record.value,
    priority: record.priority,
    comment: `Resend ${record.record} (${record.status})`,
  }));

  const outPath = resolve(process.cwd(), "scripts/resend-dns-records.json");
  writeFileSync(outPath, `${JSON.stringify(records, null, 2)}\n`);
  console.log(`Wrote ${records.length} records to ${outPath}`);
  console.log(`Resend domain status: ${detail.status}`);
  console.log("Next: CLOUDFLARE_API_TOKEN=... npm run dns:email");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
