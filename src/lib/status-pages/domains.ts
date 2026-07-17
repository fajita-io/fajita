import "server-only";

import { resolveTxt } from "node:dns/promises";

import { serviceClient } from "@/lib/supabase/service";
import { STATUS_CNAME_TARGET } from "./config";
import { dnsInstructions, normalizeCustomDomain, type DnsInstructions } from "./domain-util";
import { generateToken, hashToken, verifyToken } from "./secret";

/**
 * Custom-domain data layer. Ownership is proven with a DNS TXT challenge;
 * routing uses a CNAME to the shared target. TLS is provisioned by the hosting
 * platform after verification. A domain is globally unique while active, which
 * prevents cross-tenant takeover. Fajita never claims TLS is active before the
 * hosting platform confirms HTTPS works.
 */

export interface DomainRecord {
  id: string;
  domain: string;
  kind: "hosted_subdomain" | "custom";
  isPrimary: boolean;
  verificationStatus: "pending_dns" | "verifying" | "verified" | "failed";
  tlsStatus: "pending" | "provisioning" | "active" | "renewal_issue" | "failed" | "removed";
  cnameTarget: string | null;
  lastCheckedAt: string | null;
  verifiedAt: string | null;
  failureReason: string | null;
  instructions: DnsInstructions | null;
}

export async function listDomains(
  organizationId: string,
  statusPageId: string,
): Promise<DomainRecord[]> {
  const db = serviceClient();
  const { data } = await db
    .from("status_page_domains")
    .select(
      "id, domain, kind, is_primary, verification_status, tls_status, cname_target, last_checked_at, verified_at, failure_reason",
    )
    .eq("organization_id", organizationId)
    .eq("status_page_id", statusPageId)
    .is("removed_at", null)
    .order("kind", { ascending: true });

  const rows = data ?? [];
  const withTokens = await loadPendingTokens(rows.map((r) => r.id));
  return rows.map((r) => ({
    id: r.id,
    domain: r.domain,
    kind: r.kind as DomainRecord["kind"],
    isPrimary: r.is_primary,
    verificationStatus: r.verification_status as DomainRecord["verificationStatus"],
    tlsStatus: r.tls_status as DomainRecord["tlsStatus"],
    cnameTarget: r.cname_target,
    lastCheckedAt: r.last_checked_at,
    verifiedAt: r.verified_at,
    failureReason: r.failure_reason,
    instructions:
      r.kind === "custom" && r.verification_status !== "verified" && withTokens.has(r.id)
        ? dnsInstructions(r.domain, r.cname_target ?? STATUS_CNAME_TARGET, withTokens.get(r.id)!)
        : null,
  }));
}

/** Load the plaintext challenge token is impossible (hashed); we regenerate a
 * display token only when adding. For existing pending domains we surface the
 * instructions using a freshly rotated token to keep them actionable. */
async function loadPendingTokens(domainIds: string[]): Promise<Map<string, string>> {
  // Tokens are stored hashed and cannot be recovered. The add flow returns the
  // token once; for re-display we rely on the stored record host and a rotate
  // action. Here we return an empty map so callers show a rotate prompt.
  void domainIds;
  return new Map();
}

export type AddDomainResult =
  | { ok: true; domainId: string; instructions: DnsInstructions }
  | { ok: false; reason: string };

export async function addCustomDomain(input: {
  organizationId: string;
  statusPageId: string;
  actorProfileId: string;
  domain: string;
}): Promise<AddDomainResult> {
  const normalized = normalizeCustomDomain(input.domain);
  if (!normalized.ok) return { ok: false, reason: normalized.reason };
  const domain = normalized.domain;

  const db = serviceClient();
  // Global uniqueness: reject if any active domain already claims it.
  const { data: existing } = await db
    .from("status_page_domains")
    .select("id")
    .ilike("domain", domain)
    .is("removed_at", null)
    .maybeSingle();
  if (existing) {
    return { ok: false, reason: "That domain is already connected to a status page." };
  }

  const { data, error } = await db
    .from("status_page_domains")
    .insert({
      organization_id: input.organizationId,
      status_page_id: input.statusPageId,
      domain,
      kind: "custom",
      is_primary: false,
      verification_status: "pending_dns",
      tls_status: "pending",
      cname_target: STATUS_CNAME_TARGET,
      created_by_user_id: input.actorProfileId,
    })
    .select("id")
    .single();
  if (error) throw error;

  const token = generateToken();
  await db.from("status_page_domain_verifications").insert({
    domain_id: data.id,
    organization_id: input.organizationId,
    method: "dns_txt",
    record_host: `_fajita-challenge.${domain}`,
    token_hash: hashToken(token),
    status: "pending",
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return {
    ok: true,
    domainId: data.id,
    instructions: dnsInstructions(domain, STATUS_CNAME_TARGET, token),
  };
}

/** Rotate the verification token and return fresh DNS instructions. */
export async function rotateDomainToken(input: {
  organizationId: string;
  domainId: string;
}): Promise<{ ok: true; instructions: DnsInstructions } | { ok: false; reason: string }> {
  const db = serviceClient();
  const { data: domain } = await db
    .from("status_page_domains")
    .select("domain, cname_target")
    .eq("id", input.domainId)
    .eq("organization_id", input.organizationId)
    .is("removed_at", null)
    .maybeSingle();
  if (!domain) return { ok: false, reason: "Domain not found." };

  const token = generateToken();
  await db.from("status_page_domain_verifications").insert({
    domain_id: input.domainId,
    organization_id: input.organizationId,
    method: "dns_txt",
    record_host: `_fajita-challenge.${domain.domain}`,
    token_hash: hashToken(token),
    status: "pending",
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  return {
    ok: true,
    instructions: dnsInstructions(domain.domain, domain.cname_target ?? STATUS_CNAME_TARGET, token),
  };
}

/**
 * Check the customer's DNS for the TXT challenge. On success, mark the domain
 * verified and start TLS provisioning. TLS is not marked active here: the
 * hosting platform activates it after HTTPS is confirmed.
 */
export async function verifyDomain(input: {
  organizationId: string;
  domainId: string;
}): Promise<{ status: DomainRecord["verificationStatus"]; reason?: string }> {
  const db = serviceClient();
  const { data: domain } = await db
    .from("status_page_domains")
    .select("id, domain")
    .eq("id", input.domainId)
    .eq("organization_id", input.organizationId)
    .is("removed_at", null)
    .maybeSingle();
  if (!domain) return { status: "failed", reason: "Domain not found." };

  const { data: challenges } = await db
    .from("status_page_domain_verifications")
    .select("id, token_hash, expires_at, status")
    .eq("domain_id", input.domainId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  const now = Date.now();
  const active = (challenges ?? []).filter(
    (c) => !c.expires_at || new Date(c.expires_at).getTime() > now,
  );
  if (active.length === 0) {
    return { status: "pending_dns", reason: "No active challenge. Rotate the record and try again." };
  }

  await db
    .from("status_page_domains")
    .update({ verification_status: "verifying", last_checked_at: new Date().toISOString() })
    .eq("id", input.domainId);

  let records: string[][] = [];
  try {
    records = await resolveTxt(`_fajita-challenge.${domain.domain}`);
  } catch {
    await db
      .from("status_page_domains")
      .update({
        verification_status: "pending_dns",
        failure_reason: "No TXT record found yet. DNS changes can take time to appear.",
        last_checked_at: new Date().toISOString(),
      })
      .eq("id", input.domainId);
    return { status: "pending_dns", reason: "No TXT record found yet. DNS changes can take time to appear." };
  }

  const flattened = records.map((chunks) => chunks.join(""));
  const matched = active.find((c) =>
    flattened.some((value) => {
      const token = value.replace(/^fajita-verify=/, "");
      return value.startsWith("fajita-verify=") && verifyToken(token, c.token_hash);
    }),
  );

  if (!matched) {
    await db
      .from("status_page_domains")
      .update({
        verification_status: "pending_dns",
        failure_reason: "The TXT value does not match. Check for typos and existing TTL.",
        last_checked_at: new Date().toISOString(),
      })
      .eq("id", input.domainId);
    return { status: "pending_dns", reason: "The TXT value does not match yet." };
  }

  await db
    .from("status_page_domain_verifications")
    .update({ status: "succeeded", last_checked_at: new Date().toISOString() })
    .eq("id", matched.id);
  await db
    .from("status_page_domains")
    .update({
      verification_status: "verified",
      verified_at: new Date().toISOString(),
      tls_status: "provisioning",
      failure_reason: null,
      last_checked_at: new Date().toISOString(),
    })
    .eq("id", input.domainId);

  return { status: "verified" };
}

export async function setPrimaryDomain(input: {
  organizationId: string;
  statusPageId: string;
  domainId: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const db = serviceClient();
  const { data: domain } = await db
    .from("status_page_domains")
    .select("id, verification_status, tls_status")
    .eq("id", input.domainId)
    .eq("organization_id", input.organizationId)
    .eq("status_page_id", input.statusPageId)
    .is("removed_at", null)
    .maybeSingle();
  if (!domain) return { ok: false, reason: "Domain not found." };
  if (domain.verification_status !== "verified") {
    return { ok: false, reason: "Verify the domain before making it primary." };
  }

  await db
    .from("status_page_domains")
    .update({ is_primary: false })
    .eq("status_page_id", input.statusPageId);
  await db
    .from("status_page_domains")
    .update({ is_primary: true })
    .eq("id", input.domainId);
  await db
    .from("status_pages")
    .update({ primary_domain_id: input.domainId })
    .eq("id", input.statusPageId)
    .eq("organization_id", input.organizationId);
  return { ok: true };
}

export async function removeDomain(input: {
  organizationId: string;
  statusPageId: string;
  domainId: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const db = serviceClient();
  const { data: domain } = await db
    .from("status_page_domains")
    .select("id, kind, is_primary")
    .eq("id", input.domainId)
    .eq("organization_id", input.organizationId)
    .eq("status_page_id", input.statusPageId)
    .is("removed_at", null)
    .maybeSingle();
  if (!domain) return { ok: false, reason: "Domain not found." };
  if (domain.kind === "hosted_subdomain") {
    return { ok: false, reason: "The hosted subdomain cannot be removed." };
  }

  await db
    .from("status_page_domains")
    .update({ removed_at: new Date().toISOString(), tls_status: "removed", is_primary: false })
    .eq("id", input.domainId);

  if (domain.is_primary) {
    // Fall back to the hosted subdomain as primary.
    const { data: hosted } = await db
      .from("status_page_domains")
      .select("id")
      .eq("status_page_id", input.statusPageId)
      .eq("kind", "hosted_subdomain")
      .is("removed_at", null)
      .maybeSingle();
    await db
      .from("status_pages")
      .update({ primary_domain_id: hosted?.id ?? null })
      .eq("id", input.statusPageId);
  }
  return { ok: true };
}
