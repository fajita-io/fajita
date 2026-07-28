import type { Metadata } from "next";

import { PageHeader } from "@/components/app/ui";
import {
  TeamManager,
  type PendingInvitationView,
  type TeamCapabilities,
  type TeamMemberView,
} from "@/components/app/team-manager";
import { requireActiveContext } from "@/lib/app/page-context";
import { listOrgMembers } from "@/lib/app/organizations";
import { listPendingInvitations } from "@/lib/app/invitations";
import { can, canAssignRole, type OrgRole } from "@/lib/auth/roles";
import { forbiddenRedirect } from "@/lib/app/guards";

export const metadata: Metadata = {
  title: "Team",
  robots: { index: false, follow: false },
};

export default async function TeamPage() {
  const { profile, membership } = await requireActiveContext();
  const role = membership.role;
  const orgId = membership.organization.id;

  if (!can(role, "members:read")) forbiddenRedirect();

  const canManageInvites = can(role, "invitations:read");
  const [rawMembers, rawInvites] = await Promise.all([
    listOrgMembers(orgId, profile.id),
    canManageInvites ? listPendingInvitations(orgId) : Promise.resolve([]),
  ]);

  const members: TeamMemberView[] = rawMembers.map((m) => ({
    membershipId: m.membershipId,
    role: m.role,
    displayName: m.displayName,
    email: m.email,
    avatarUrl: m.avatarUrl,
    joinedAt: m.joinedAt,
    isYou: m.isYou,
  }));

  const invitations: PendingInvitationView[] = rawInvites.map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role,
    createdAt: i.createdAt,
    expiresAt: i.expiresAt,
    isExpired: i.isExpired,
  }));

  const assignableRoles = (["admin", "member"] as OrgRole[]).filter((r) =>
    canAssignRole(role, r),
  );

  const caps: TeamCapabilities = {
    canInvite: can(role, "members:invite"),
    canManageInvites,
    canChangeRole: can(role, "members:change_role"),
    canRemove: can(role, "members:remove"),
    canLeave: role !== "owner",
    assignableRoles: assignableRoles.length > 0 ? assignableRoles : ["member"],
  };

  return (
    <>
      <PageHeader
        title="Team"
        description="The people in this organization and the invitations waiting to be accepted."
      />
      <TeamManager
        organizationId={orgId}
        members={members}
        invitations={invitations}
        caps={caps}
      />
    </>
  );
}
