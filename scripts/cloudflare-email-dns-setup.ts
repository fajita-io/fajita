/**
 * Apply Resend + DMARC DNS records to Cloudflare for fajita.io.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... npm run dns:email
 *
 * Record sources (first match wins):
 *   1. RESEND_FULL_API_KEY → fetch live records from Resend API
 *   2. scripts/resend-dns-records.json
 *
 * Always adds a monitoring DMARC record at _dmarc.fajita.io unless disabled.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  applyZoneRecords,
  type DnsRecordInput,
} from "./lib/cloudflare-dns";

const DOMAIN = process.env.RESEND_DOMAIN ?? "fajita.io";
const DMARC_RUA = process.env.DMARC_RUA_EMAIL ?? "alerts@fajita.io";

async function fetchResendRecords(): Promise<DnsRecordInput[]> {
  const apiKey = process.env.RESEND_FULL_API_KEY ?? process.env.RESEND_ADMIN_API_KEY;
  if (!apiKey) return [];

  const res = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const listed = (await res.json()) as { data?: { id: string; name: string }[]; message?: string };
  if (!res.ok) {
    throw new Error(`Resend domains list failed: ${listed.message ?? res.statusText}`);
  }

  const domain = listed.data?.find((d) => d.name === DOMAIN);
  if (!domain) {
    throw new Error(`Resend domain ${DOMAIN} not found. Run npm run resend:fetch-dns first.`);
  }

  const detailRes = await fetch(`https://api.resend.com/domains/${domain.id}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const detail = (await detailRes.json()) as {
    records?: { name: string; type: string; value: string; priority?: number; record: string; status: string }[];
    message?: string;
  };
  if (!detailRes.ok) {
    throw new Error(`Resend domain detail failed: ${detail.message ?? detailRes.statusText}`);
  }

  return (detail.records ?? []).map((record) => ({
    type: record.type.toUpperCase() as DnsRecordInput["type"],
    name: record.name.endsWith(`.${DOMAIN}`) ? record.name : `${record.name}.${DOMAIN}`,
    content: record.value,
    priority: record.priority,
    proxied: false,
    comment: `Resend ${record.record} (${record.status})`,
  }));
}

function loadJsonRecords(): DnsRecordInput[] {
  const path = resolve(process.cwd(), "scripts/resend-dns-records.json");
  if (!existsSync(path)) return [];
  const parsed = JSON.parse(readFileSync(path, "utf8")) as DnsRecordInput[];
  return parsed.map((record) => ({ ...record, proxied: record.proxied ?? false }));
}

function dmarcRecord(): DnsRecordInput {
  return {
    type: "TXT",
    name: `_dmarc.${DOMAIN}`,
    content: `v=DMARC1; p=none; rua=mailto:${DMARC_RUA}; fo=1`,
    proxied: false,
    comment: "DMARC monitoring policy (start with p=none)",
  };
}

async function main() {
  if (process.env.DMARC_ONLY === "1") {
    await applyZoneRecords([dmarcRecord()]);
    console.log("\nDMARC record applied.");
    return;
  }

  let records = await fetchResendRecords();
  if (records.length === 0) {
    records = loadJsonRecords();
  }

  if (records.length === 0) {
    throw new Error(
      "No Resend DNS records found. Set RESEND_FULL_API_KEY or create scripts/resend-dns-records.json via npm run resend:fetch-dns.",
    );
  }

  if (process.env.DMARC_DISABLE !== "1") {
    records.push(dmarcRecord());
  }

  await applyZoneRecords(records);
  console.log("\nNext:");
  console.log("  1. Wait for Resend domain verification in the dashboard.");
  console.log("  2. Set ALERT_EMAIL_FROM and RESEND_API_KEY in Vercel production.");
  console.log("  3. Configure Resend webhook → https://fajita.io/api/webhooks/subscriber-email");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
