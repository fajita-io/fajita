import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import type { ProfileRow } from "@/lib/auth/provisioning";
import type { OrgRole } from "@/lib/auth/roles";
import { recordAuditEvent } from "./audit";
import { Conflict } from "@/lib/auth/errors";
import { normalizeSlug, validateSlug } from "./slug";

export type OrgRow = Database["public"]["Tables"]["organizations"]["Row"];
type MemberRow = Database["public"]["Tables"]["organization_members"]["Row"];

export interface Membership {
  organization: OrgRow;
  role: OrgRole;
  status: string;
}

/** Organizations the profile actively belongs to, owner-first then alpha. */
export async function listMemberships(
  profileId: string,
): Promise<Membership[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("organization_members")
    .select("role, status, organizations!inner(*)")
    .eq("user_id", profileId)
    .eq("status", "active");
  if (error) throw error;

  return (data ?? [])
    .map((row) => ({
      organization: row.organizations as unknown as OrgRow,
      role: row.role as OrgRole,
      status: row.status,
    }))
    .filter((m) => m.organization.status !== "deleted")
    .sort((a, b) => {
      if (a.role === "owner" && b.role !== "owner") return -1;
      if (b.role === "owner" && a.role !== "owner") return 1;
      return a.organization.name.localeCompare(b.organization.name);
    });
}

/**
 * Resolve which organization is active for this request. Honors a requested id
 * only if the caller actually belongs to it; otherwise falls back to the first
 * membership. Returns null when the user belongs to no organization.
 */
export async function resolveActiveOrg(
  profileId: string,
  requestedId: string | null,
): Promise<Membership | null> {
  const memberships = await listMemberships(profileId);
  if (memberships.length === 0) return null;
  if (requestedId) {
    const match = memberships.find((m) => m.organization.id === requestedId);
    if (match) return match;
  }
  return memberships[0];
}

async function insertUniqueSlug(
  db: ReturnType<typeof serviceClient>,
  base: string,
  build: (slug: string) => Record<string, unknown>,
): Promise<OrgRow> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate =
      attempt === 0 ? base : normalizeSlug(`${base}-${attempt + 1}`);
    const { data, error } = await db
      .from("organizations")
      .insert(build(candidate) as never)
      .select("*")
      .single();
    if (!error && data) return data;
    if (error && error.code !== "23505") throw error;
  }
  throw Conflict("Could not find an available handle. Try a different name.");
}

/**
 * Create an organization and make the caller its owner. Also seeds the org-
 * level onboarding row and records an audit event. If membership creation
 * fails after the org row is created, the org is rolled back so we never leave
 * an ownerless organization.
 */
export async function createOrganization(input: {
  profile: ProfileRow;
  name: string;
  slug: string;
  timezone: string;
}): Promise<OrgRow> {
  const name = input.name.trim();
  if (name.length < 1 || name.length > 120) {
    throw Conflict("Organization name must be 1 to 120 characters.");
  }
  const slugCheck = validateSlug(input.slug);
  if (!slugCheck.ok) throw Conflict(slugCheck.reason);

  const db = serviceClient();

  const org = await insertUniqueSlug(db, slugCheck.slug, (slug) => ({
    name,
    slug,
    owner_user_id: input.profile.id,
    default_timezone: input.timezone || "UTC",
  }));

  const { error: memberError } = await db.from("organization_members").insert({
    organization_id: org.id,
    user_id: input.profile.id,
    role: "owner",
    status: "active",
  });
  if (memberError) {
    // Roll back the org so it is never left ownerless.
    await db.from("organizations").delete().eq("id", org.id);
    throw memberError;
  }

  await db
    .from("organization_onboarding")
    .insert({ organization_id: org.id, steps: {} });

  await recordAuditEvent({
    organizationId: org.id,
    actorUserId: input.profile.id,
    action: "organization.created",
    targetType: "organization",
    targetId: org.id,
    summary: `Created ${org.name}`,
    metadata: { slug: org.slug },
  });

  return org;
}

export interface OrgMember {
  membershipId: string;
  profileId: string;
  role: OrgRole;
  status: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  joinedAt: string;
  isYou: boolean;
}

/** Members of an organization with their public profile fields (service role). */
export async function listOrgMembers(
  organizationId: string,
  currentProfileId: string,
): Promise<OrgMember[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("organization_members")
    .select("id, user_id, role, status, joined_at, user_profiles!inner(display_name, primary_email, avatar_url)")
    .eq("organization_id", organizationId)
    .neq("status", "removed")
    .order("joined_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const profile = row.user_profiles as unknown as {
      display_name: string | null;
      primary_email: string | null;
      avatar_url: string | null;
    };
    return {
      membershipId: row.id,
      profileId: row.user_id,
      role: row.role as OrgRole,
      status: row.status,
      displayName: profile.display_name,
      email: profile.primary_email,
      avatarUrl: profile.avatar_url,
      joinedAt: row.joined_at,
      isYou: row.user_id === currentProfileId,
    };
  });
}

/** Count of active members, for readiness summaries. */
export async function countActiveMembers(
  organizationId: string,
): Promise<number> {
  const db = serviceClient();
  const { count } = await db
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "active");
  return count ?? 0;
}

export type { MemberRow };
