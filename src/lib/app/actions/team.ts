"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  requireAuthenticatedUser,
  requireOrganizationMembership,
  requireOrganizationPermission,
} from "@/lib/auth/context";
import { canAssignRole, type OrgRole } from "@/lib/auth/roles";
import { recordAuditEvent } from "@/lib/app/audit";
import { serviceClient } from "@/lib/supabase/service";
import { appUrl } from "@/lib/env";
import { Conflict, Forbidden } from "@/lib/auth/errors";
import {
  acceptInvitation,
  createInvitation,
  resendInvitation,
  revokeInvitation,
} from "@/lib/app/invitations";
import { markOnboardingStepAction } from "./onboarding";
import { DataFastGoals } from "@/lib/analytics/goals";
import { trackGoal } from "@/lib/analytics/server";
import { toActionError, type ActionResult } from "./shared";

function inviteLink(token: string): string {
  return `${appUrl}/app/invite/${token}`;
}

const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(320),
  role: z.enum(["admin", "member"]),
});

export async function createInvitationAction(
  organizationId: string,
  input: z.input<typeof inviteSchema>,
): Promise<ActionResult<{ link: string; email: string }>> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "members:invite",
    );
    const parsed = inviteSchema.parse(input);
    if (!canAssignRole(access.role, parsed.role as OrgRole)) {
      throw Forbidden("You cannot invite someone at that role.");
    }

    await trackGoal({
      name: DataFastGoals.teamInviteInitiated,
      metadata: { role: parsed.role },
    }).catch(() => {});

    const invite = await createInvitation({
      organizationId,
      email: parsed.email,
      role: parsed.role as OrgRole,
      invitedByUserId: access.profile.id,
    });

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "invitation.created",
      targetType: "invitation",
      targetId: invite.id,
      summary: `Invited ${invite.email} as ${invite.role}`,
      metadata: { role: invite.role },
    });
    await markOnboardingStepAction(organizationId, "invite_done").catch(() => {});
    await trackGoal({ name: DataFastGoals.teamInviteCreated }).catch(() => {});

    revalidatePath("/app/team");
    return { ok: true, data: { link: inviteLink(invite.token), email: invite.email } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function resendInvitationAction(
  organizationId: string,
  invitationId: string,
): Promise<ActionResult<{ link: string; email: string }>> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "invitations:manage",
    );
    const invite = await resendInvitation(organizationId, invitationId);
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "invitation.resent",
      targetType: "invitation",
      targetId: invitationId,
      summary: `Resent invitation to ${invite.email}`,
    });
    revalidatePath("/app/team");
    return { ok: true, data: { link: inviteLink(invite.token), email: invite.email } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function revokeInvitationAction(
  organizationId: string,
  invitationId: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "invitations:manage",
    );
    const { email } = await revokeInvitation(organizationId, invitationId);
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "invitation.revoked",
      targetType: "invitation",
      targetId: invitationId,
      summary: `Revoked invitation to ${email}`,
    });
    revalidatePath("/app/team");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const roleSchema = z.enum(["admin", "member"]);

export async function changeMemberRoleAction(
  organizationId: string,
  membershipId: string,
  role: OrgRole,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "members:change_role",
    );
    const nextRole = roleSchema.parse(role);
    if (!canAssignRole(access.role, nextRole)) {
      throw Forbidden("You cannot assign that role.");
    }

    const db = serviceClient();
    const { data: target } = await db
      .from("organization_members")
      .select("id, user_id, role, status")
      .eq("id", membershipId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!target || target.status !== "active") {
      throw Conflict("That member is no longer active.");
    }
    if (target.role === "owner") {
      throw Forbidden("The owner's role changes only through ownership transfer.");
    }
    if (target.user_id === access.profile.id) {
      throw Forbidden("You cannot change your own role.");
    }
    if (target.role === nextRole) return { ok: true };

    const { error } = await db
      .from("organization_members")
      .update({ role: nextRole })
      .eq("id", membershipId);
    if (error) throw error;

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "member.role_changed",
      targetType: "member",
      targetId: membershipId,
      summary: `Changed role to ${nextRole}`,
      metadata: { from: target.role, to: nextRole },
    });
    await trackGoal({ name: DataFastGoals.memberRoleChanged }).catch(() => {});
    revalidatePath("/app/team");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function removeMemberAction(
  organizationId: string,
  membershipId: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "members:remove",
    );
    const db = serviceClient();
    const { data: target } = await db
      .from("organization_members")
      .select("id, user_id, role, status")
      .eq("id", membershipId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!target || target.status === "removed") {
      throw Conflict("That member is no longer part of the organization.");
    }
    if (target.role === "owner") {
      throw Forbidden("The owner cannot be removed. Transfer ownership first.");
    }
    if (target.user_id === access.profile.id) {
      throw Forbidden("Use 'Leave organization' to remove yourself.");
    }

    const { error } = await db
      .from("organization_members")
      .update({ status: "removed" })
      .eq("id", membershipId);
    if (error) throw error;

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "member.removed",
      targetType: "member",
      targetId: membershipId,
    });
    await trackGoal({ name: DataFastGoals.memberRemoved }).catch(() => {});
    revalidatePath("/app/team");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function leaveOrganizationAction(
  organizationId: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationMembership(organizationId);
    if (access.role === "owner") {
      throw Forbidden(
        "As owner you must transfer ownership or delete the organization before leaving.",
      );
    }
    const db = serviceClient();
    const { error } = await db
      .from("organization_members")
      .update({ status: "removed" })
      .eq("organization_id", organizationId)
      .eq("user_id", access.profile.id);
    if (error) throw error;

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "member.left",
      targetType: "member",
      targetId: access.membership.id,
    });
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function acceptInvitationAction(
  token: string,
): Promise<ActionResult<{ organizationId: string }>> {
  try {
    const profile = await requireAuthenticatedUser();
    const result = await acceptInvitation({
      token,
      profileId: profile.id,
      profileEmail: profile.primary_email,
    });

    if (result.status === "invalid") {
      return { ok: false, error: "This invitation is no longer valid." };
    }
    if (result.status === "expired") {
      return { ok: false, error: "This invitation has expired. Ask for a new one." };
    }
    if (result.status === "wrong_email") {
      return {
        ok: false,
        error: `This invitation was sent to ${result.invitedEmail}. Sign in with that email to accept.`,
      };
    }

    if (!result.alreadyMember) {
      await recordAuditEvent({
        organizationId: result.organizationId,
        actorUserId: profile.id,
        action: "invitation.accepted",
        targetType: "member",
        targetId: profile.id,
      });
      await trackGoal({ name: DataFastGoals.teamInviteAccepted }).catch(() => {});
    }
    revalidatePath("/app", "layout");
    return { ok: true, data: { organizationId: result.organizationId } };
  } catch (error) {
    return toActionError(error);
  }
}
