/**
 * Idempotent Cloudflare DNS setup for fajita.io → Vercel.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... npx tsx scripts/cloudflare-dns-setup.ts
 *
 * Optional overrides:
 *   CLOUDFLARE_ZONE_ID (default: 0e44cc835b97bd56dc0b6731b099fb34)
 *   CLOUDFLARE_ACCOUNT_ID (default: e4f4f02d85a43769e102a361824dfc60)
 *   VERCEL_APEX_IP (default: 76.76.21.21)
 *
 * Creates DNS-only records (proxied: false) so Vercel terminates TLS.
 * Safe to re-run; updates matching records in place.
 */

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID ?? "0e44cc835b97bd56dc0b6731b099fb34";
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "e4f4f02d85a43769e102a361824dfc60";
const VERCEL_APEX_IP = process.env.VERCEL_APEX_IP ?? "76.76.21.21";
const VERCEL_PROJECT_CNAME =
  process.env.VERCEL_PROJECT_CNAME ?? "4106b7d014662895.vercel-dns-016.com";
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;

type DnsRecord = {
  type: "A" | "CNAME" | "TXT";
  name: string;
  content: string;
  proxied?: boolean;
  ttl?: number;
  comment?: string;
};

const TARGET_RECORDS: DnsRecord[] = [
  {
    type: "A",
    name: "fajita.io",
    content: VERCEL_APEX_IP,
    comment: "Vercel production (marketing + app)",
  },
  {
    type: "A",
    name: "www.fajita.io",
    content: VERCEL_APEX_IP,
    comment: "Vercel production www",
  },
  {
    type: "A",
    name: "status.fajita.io",
    content: VERCEL_APEX_IP,
    comment: "Status page zone apex on Vercel",
  },
  {
    type: "CNAME",
    name: "*.status.fajita.io",
    content: VERCEL_PROJECT_CNAME,
    comment: "Hosted status subdomains on Vercel (wildcard CNAME)",
  },
  {
    type: "CNAME",
    name: "cname.status.fajita.io",
    content: VERCEL_PROJECT_CNAME,
    comment: "Customer custom-domain CNAME target on Vercel",
  },
];

type CfDnsRecord = {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied?: boolean;
  comment?: string;
};

type CfResponse<T> = {
  success: boolean;
  errors: { code: number; message: string }[];
  result: T;
};

async function cf<T>(path: string, init?: RequestInit): Promise<T> {
  if (!TOKEN) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN is required. Create a token with Zone:DNS:Edit for fajita.io.",
    );
  }

  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = (await res.json()) as CfResponse<T>;
  if (!body.success) {
    const detail = body.errors.map((e) => `${e.code}: ${e.message}`).join("; ");
    throw new Error(`Cloudflare API ${path} failed: ${detail || res.statusText}`);
  }
  return body.result;
}

function normalizeName(name: string): string {
  return name.endsWith(".") ? name.slice(0, -1) : name;
}

async function listRecords(): Promise<CfDnsRecord[]> {
  const all: CfDnsRecord[] = [];
  let page = 1;
  while (true) {
    const batch = await cf<CfDnsRecord[]>(
      `/zones/${ZONE_ID}/dns_records?per_page=100&page=${page}`,
    );
    all.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return all;
}

async function upsertRecord(target: DnsRecord, existing: CfDnsRecord[]): Promise<"created" | "updated" | "unchanged" | "replaced"> {
  const normalized = normalizeName(target.name);
  const match = existing.find(
    (r) =>
      r.type === target.type &&
      normalizeName(r.name) === normalized &&
      r.content === target.content &&
      (r.proxied ?? false) === (target.proxied ?? false),
  );
  if (match) return "unchanged";

  const sameName = existing.filter((r) => normalizeName(r.name) === normalized);
  const sameNameType = sameName.filter((r) => r.type === target.type);

  const payload = {
    type: target.type,
    name: target.name,
    content: target.content,
    proxied: target.proxied ?? false,
    ttl: target.ttl ?? 1,
    comment: target.comment,
  };

  if (sameNameType.length === 1) {
    await cf(`/zones/${ZONE_ID}/dns_records/${sameNameType[0].id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return "updated";
  }

  if (sameNameType.length > 1) {
    throw new Error(
      `Multiple ${target.type} records for ${target.name}. Resolve manually in Cloudflare, then re-run.`,
    );
  }

  // Cloudflare rejects mixed types on the same name (for example CNAME + A).
  for (const conflict of sameName) {
    await cf(`/zones/${ZONE_ID}/dns_records/${conflict.id}`, { method: "DELETE" });
  }

  await cf(`/zones/${ZONE_ID}/dns_records`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return sameName.length > 0 ? "replaced" : "created";
}

async function main() {
  const zone = await cf<{
    id: string;
    name: string;
    account: { id: string };
    name_servers: string[];
    status: string;
  }>(`/zones/${ZONE_ID}`);

  if (zone.name !== "fajita.io") {
    throw new Error(`Zone ${ZONE_ID} is ${zone.name}, expected fajita.io`);
  }
  if (zone.account.id !== ACCOUNT_ID) {
    console.warn(
      `Warning: zone account ${zone.account.id} differs from CLOUDFLARE_ACCOUNT_ID ${ACCOUNT_ID}`,
    );
  }

  console.log(`Zone: ${zone.name} (${zone.status})`);
  console.log(`Nameservers: ${zone.name_servers.join(", ")}`);

  const existing = await listRecords();
  const results: { name: string; action: string }[] = [];

  for (const target of TARGET_RECORDS) {
    const action = await upsertRecord(target, existing);
    results.push({ name: target.name, action });
    console.log(`${action.padEnd(9)} ${target.type} ${target.name} → ${target.content}`);
  }

  const created = results.filter((r) => r.action === "created" || r.action === "replaced").length;
  const updated = results.filter((r) => r.action === "updated").length;
  console.log(`\nDone. ${created} created/replaced, ${updated} updated, ${results.length - created - updated} unchanged.`);
  console.log("\nNext:");
  console.log("  1. Wait a few minutes for DNS propagation.");
  console.log("  2. vercel domains inspect fajita.io");
  console.log("  3. SMOKE_BASE_URL=https://fajita.io npm run smoke:public");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
