import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import type { OrgRole } from "@/lib/auth/roles";
import { Conflict, RateLimited } from "@/lib/auth/errors";

export type InvitationRow =
  Database["public"]["Tables"]["organization_invitations"]["Row"];

const INVITE_TTL_DAYS = 7;
const MAX_PENDING_PER_ORG = 100;
const MAX_CREATED_PER_HOUR = 20;

/** Normalize an email for storage and comparison. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Random opaque invitation token (returned once, never stored raw). */
function generateToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: OrgRole;
  invitedByName: string | null;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
}

/** Pending (not accepted, not revoked) invitations for an organization. */
export async function listPendingInvitations(
  organizationId: string,
): Promise<PendingInvitation[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("organization_invitations")
    .select(
      "id, email, role, created_at, expires_at, inviter:user_profiles!organization_invitations_invited_by_user_id_fkey(display_name)",
    )
    .eq("organization_id", organizationId)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const now = Date.now();
  return (data ?? []).map((row) => {
    const inviter = row.inviter as unknown as { display_name: string | null } | null;
    return {
      id: row.id,
      email: row.email,
      role: row.role as OrgRole,
      invitedByName: inviter?.display_name ?? null,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      isExpired: new Date(row.expires_at).getTime() < now,
    };
  });
}

async function assertNotAlreadyMember(
  organizationId: string,
  email: string,
): Promise<void> {
  const db = serviceClient();
  const { data: profile } = await db
    .from("user_profiles")
    .select("id")
    .eq("primary_email", email)
    .maybeSingle();
  if (!profile) return;
  const { data: member } = await db
    .from("organization_members")
    .select("id, status")
    .eq("organization_id", organizationId)
    .eq("user_id", profile.id)
    .maybeSingle();
  if (member && member.status === "active") {
    throw Conflict("That person is already on the team.");
  }
}

async function assertWithinRateLimits(organizationId: string): Promise<void> {
  const db = serviceClient();
  const { count: pending } = await db
    .from("organization_invitations")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .is("accepted_at", null)
    .is("revoked_at", null);
  if ((pending ?? 0) >= MAX_PENDING_PER_ORG) {
    throw RateLimited("You have a lot of pending invitations. Clear some first.");
  }
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recent } = await db
    .from("organization_invitations")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("created_at", hourAgo);
  if ((recent ?? 0) >= MAX_CREATED_PER_HOUR) {
    throw RateLimited("Too many invitations just now. Try again in a little while.");
  }
}

export interface CreatedInvitation {
  id: string;
  email: string;
  role: OrgRole;
  token: string;
  expiresAt: string;
}

/**
 * Create a pending invitation. Stores only a hash of the token; the raw token
 * is returned once for the caller to deliver (or display, until email is
 * configured). Enforces one live invitation per org+email, blocks inviting an
 * existing member, and applies simple rate limits.
 */
export async function createInvitation(input: {
  organizationId: string;
  email: string;
  role: OrgRole;
  invitedByUserId: string;
}): Promise<CreatedInvitation> {
  const email = normalizeEmail(input.email);
  await assertNotAlreadyMember(input.organizationId, email);
  await assertWithinRateLimits(input.organizationId);

  const { token, hash } = generateToken();
  const expiresAt = new Date(
    Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const db = serviceClient();
  const { data, error } = await db
    .from("organization_invitations")
    .insert({
      organization_id: input.organizationId,
      email,
      role: input.role,
      token_hash: hash,
      invited_by_user_id: input.invitedByUserId,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw Conflict("There is already a pending invitation for that email.");
    }
    throw error;
  }

  return { id: data.id, email, role: input.role, token, expiresAt };
}

/** Rotate the token and extend expiry on an existing pending invitation. */
export async function resendInvitation(
  organizationId: string,
  invitationId: string,
): Promise<CreatedInvitation> {
  const db = serviceClient();
  const { data: existing } = await db
    .from("organization_invitations")
    .select("*")
    .eq("id", invitationId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!existing || existing.accepted_at || existing.revoked_at) {
    throw Conflict("That invitation is no longer active.");
  }
  await assertWithinRateLimits(organizationId);

  const { token, hash } = generateToken();
  const expiresAt = new Date(
    Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { error } = await db
    .from("organization_invitations")
    .update({ token_hash: hash, expires_at: expiresAt })
    .eq("id", invitationId);
  if (error) throw error;

  return {
    id: invitationId,
    email: existing.email,
    role: existing.role as OrgRole,
    token,
    expiresAt,
  };
}

/** Revoke a pending invitation (idempotent). */
export async function revokeInvitation(
  organizationId: string,
  invitationId: string,
): Promise<{ email: string }> {
  const db = serviceClient();
  const { data, error } = await db
    .from("organization_invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", invitationId)
    .eq("organization_id", organizationId)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .select("email")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw Conflict("That invitation is no longer active.");
  return { email: data.email };
}

export type AcceptResult =
  | { status: "accepted"; organizationId: string; alreadyMember: boolean }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "wrong_email"; invitedEmail: string };

/**
 * Accept an invitation by raw token, binding it to the authenticated user.
 * Idempotent: re-accepting an already-accepted invitation by the same user is a
 * no-op success. Verifies the invited email matches the accepting account so an
 * invitation never grants access to the wrong identity.
 */
export async function acceptInvitation(input: {
  token: string;
  profileId: string;
  profileEmail: string | null;
}): Promise<AcceptResult> {
  const db = serviceClient();
  const hash = hashToken(input.token);
  const { data: invite } = await db
    .from("organization_invitations")
    .select("*")
    .eq("token_hash", hash)
    .maybeSingle();

  if (!invite || invite.revoked_at) return { status: "invalid" };

  // Idempotent re-accept by the same account.
  if (invite.accepted_at) {
    if (invite.accepted_by_user_id === input.profileId) {
      return {
        status: "accepted",
        organizationId: invite.organization_id,
        alreadyMember: true,
      };
    }
    return { status: "invalid" };
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { status: "expired" };
  }

  const email = input.profileEmail ? normalizeEmail(input.profileEmail) : null;
  if (!email || email !== invite.email) {
    return { status: "wrong_email", invitedEmail: invite.email };
  }

  // Upsert membership (reactivates a previously removed member without dupes).
  const { data: existingMember } = await db
    .from("organization_members")
    .select("id, status")
    .eq("organization_id", invite.organization_id)
    .eq("user_id", input.profileId)
    .maybeSingle();

  let alreadyMember = false;
  if (existingMember) {
    if (existingMember.status === "active") {
      alreadyMember = true;
    } else {
      await db
        .from("organization_members")
        .update({ status: "active", role: invite.role })
        .eq("id", existingMember.id);
    }
  } else {
    await db.from("organization_members").insert({
      organization_id: invite.organization_id,
      user_id: input.profileId,
      role: invite.role,
      status: "active",
      invited_by_user_id: invite.invited_by_user_id,
    });
  }

  await db
    .from("organization_invitations")
    .update({
      accepted_at: new Date().toISOString(),
      accepted_by_user_id: input.profileId,
    })
    .eq("id", invite.id);

  return {
    status: "accepted",
    organizationId: invite.organization_id,
    alreadyMember,
  };
}

/** Look up an invitation for display on the accept screen (no token leak). */
export async function peekInvitation(token: string): Promise<{
  organizationName: string;
  email: string;
  role: OrgRole;
  isExpired: boolean;
  isConsumed: boolean;
} | null> {
  const db = serviceClient();
  const { data } = await db
    .from("organization_invitations")
    .select("email, role, accepted_at, revoked_at, expires_at, organizations!inner(name)")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!data) return null;
  const org = data.organizations as unknown as { name: string };
  return {
    organizationName: org.name,
    email: data.email,
    role: data.role as OrgRole,
    isExpired: new Date(data.expires_at).getTime() < Date.now(),
    isConsumed: Boolean(data.accepted_at || data.revoked_at),
  };
}
