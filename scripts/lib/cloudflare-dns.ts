/**
 * Shared Cloudflare DNS helpers for setup scripts.
 */

export const DEFAULT_ZONE_ID = "0e44cc835b97bd56dc0b6731b099fb34";
export const DEFAULT_ACCOUNT_ID = "e4f4f02d85a43769e102a361824dfc60";

export type DnsRecordInput = {
  type: "A" | "CNAME" | "TXT" | "MX";
  name: string;
  content: string;
  proxied?: boolean;
  ttl?: number;
  priority?: number;
  comment?: string;
};

type CfDnsRecord = {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied?: boolean;
  priority?: number;
  comment?: string;
};

type CfResponse<T> = {
  success: boolean;
  errors: { code: number; message: string }[];
  result: T;
};

export function cloudflareToken(): string {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN is required. Create a token with Zone:DNS:Edit for fajita.io.",
    );
  }
  return token;
}

export function zoneId(): string {
  return process.env.CLOUDFLARE_ZONE_ID ?? DEFAULT_ZONE_ID;
}

export function accountId(): string {
  return process.env.CLOUDFLARE_ACCOUNT_ID ?? DEFAULT_ACCOUNT_ID;
}

async function cf<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cloudflareToken()}`,
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

export async function listZoneRecords(): Promise<CfDnsRecord[]> {
  const id = zoneId();
  const all: CfDnsRecord[] = [];
  let page = 1;
  while (true) {
    const batch = await cf<CfDnsRecord[]>(
      `/zones/${id}/dns_records?per_page=100&page=${page}`,
    );
    all.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return all;
}

export async function upsertZoneRecord(
  target: DnsRecordInput,
  existing: CfDnsRecord[],
): Promise<"created" | "updated" | "unchanged" | "replaced"> {
  const id = zoneId();
  const normalized = normalizeName(target.name);
  const match = existing.find(
    (r) =>
      r.type === target.type &&
      normalizeName(r.name) === normalized &&
      r.content === target.content &&
      (r.proxied ?? false) === (target.proxied ?? false) &&
      (target.type !== "MX" || r.priority === target.priority),
  );
  if (match) return "unchanged";

  const sameName = existing.filter((r) => normalizeName(r.name) === normalized);
  const sameNameType = sameName.filter((r) => r.type === target.type);

  const payload: Record<string, unknown> = {
    type: target.type,
    name: target.name,
    content: target.content,
    proxied: target.proxied ?? false,
    ttl: target.ttl ?? 1,
    comment: target.comment,
  };
  if (target.type === "MX") {
    payload.priority = target.priority ?? 10;
  }

  if (sameNameType.length === 1) {
    await cf(`/zones/${id}/dns_records/${sameNameType[0].id}`, {
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

  for (const conflict of sameName) {
    await cf(`/zones/${id}/dns_records/${conflict.id}`, { method: "DELETE" });
  }

  await cf(`/zones/${id}/dns_records`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return sameName.length > 0 ? "replaced" : "created";
}

export async function getZoneSummary() {
  return cf<{
    id: string;
    name: string;
    account: { id: string };
    name_servers: string[];
    status: string;
  }>(`/zones/${zoneId()}`);
}

export async function applyZoneRecords(
  records: DnsRecordInput[],
): Promise<void> {
  const zone = await getZoneSummary();
  if (zone.name !== "fajita.io") {
    throw new Error(`Zone ${zoneId()} is ${zone.name}, expected fajita.io`);
  }
  if (zone.account.id !== accountId()) {
    console.warn(
      `Warning: zone account ${zone.account.id} differs from CLOUDFLARE_ACCOUNT_ID ${accountId()}`,
    );
  }

  console.log(`Zone: ${zone.name} (${zone.status})`);
  console.log(`Nameservers: ${zone.name_servers.join(", ")}`);

  const existing = await listZoneRecords();
  for (const target of records) {
    const action = await upsertZoneRecord(target, existing);
    const suffix = target.type === "MX" ? ` priority ${target.priority ?? 10}` : "";
    console.log(
      `${action.padEnd(9)} ${target.type} ${target.name} → ${target.content}${suffix}`,
    );
  }
}
