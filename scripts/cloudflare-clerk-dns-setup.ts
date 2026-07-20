/**
 * Idempotent Cloudflare DNS for Clerk production domains on fajita.io.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... npx tsx scripts/cloudflare-clerk-dns-setup.ts
 */
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID ?? "0e44cc835b97bd56dc0b6731b099fb34";
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const CLERK_RECORDS = [
  { type: "CNAME" as const, name: "clerk.fajita.io", content: "frontend-api.clerk.services" },
  { type: "CNAME" as const, name: "accounts.fajita.io", content: "accounts.clerk.services" },
  { type: "CNAME" as const, name: "clkmail.fajita.io", content: "mail.22giblw4f189.clerk.services" },
  { type: "CNAME" as const, name: "clk._domainkey.fajita.io", content: "dkim1.22giblw4f189.clerk.services" },
  { type: "CNAME" as const, name: "clk2._domainkey.fajita.io", content: "dkim2.22giblw4f189.clerk.services" },
];

type CfDnsRecord = { id: string; type: string; name: string; content: string; proxied?: boolean };

async function cf<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = (await res.json()) as { success: boolean; errors: { message: string }[]; result: T };
  if (!json.success) {
    throw new Error(json.errors?.[0]?.message ?? `Cloudflare ${path} failed`);
  }
  return json.result;
}

async function upsert(record: (typeof CLERK_RECORDS)[number]): Promise<void> {
  const existing = await cf<CfDnsRecord[]>(
    `/zones/${ZONE_ID}/dns_records?type=${record.type}&name=${encodeURIComponent(record.name)}`,
  );
  const match = existing.find((r) => r.name === record.name);
  const body = {
    type: record.type,
    name: record.name,
    content: record.content,
    proxied: false,
    ttl: 1,
    comment: "Clerk production (DNS only)",
  };
  if (match) {
    await cf(`/zones/${ZONE_ID}/dns_records/${match.id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    console.log(`Updated ${record.name}`);
  } else {
    await cf(`/zones/${ZONE_ID}/dns_records`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    console.log(`Created ${record.name}`);
  }
}

async function main(): Promise<void> {
  if (!TOKEN) {
    console.error("Missing CLOUDFLARE_API_TOKEN");
    process.exit(1);
  }
  for (const record of CLERK_RECORDS) {
    await upsert(record);
  }
  console.log("Clerk DNS records applied. Allow a few minutes for propagation.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
