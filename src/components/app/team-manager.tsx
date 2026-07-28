"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { Avatar, EmptyState, RoleBadge } from "./ui";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast";
import {
  changeMemberRoleAction,
  createInvitationAction,
  leaveOrganizationAction,
  removeMemberAction,
  resendInvitationAction,
  revokeInvitationAction,
} from "@/lib/app/actions/team";
import { relativeTime } from "@/lib/app/format";
import type { OrgRole } from "@/lib/auth/roles";

export interface TeamMemberView {
  membershipId: string;
  role: OrgRole;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  joinedAt: string;
  isYou: boolean;
}

export interface PendingInvitationView {
  id: string;
  email: string;
  role: OrgRole;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
}

export interface TeamCapabilities {
  canInvite: boolean;
  canManageInvites: boolean;
  canChangeRole: boolean;
  canRemove: boolean;
  canLeave: boolean;
  /** Roles the viewer may assign, most-privileged first. */
  assignableRoles: OrgRole[];
}

export function TeamManager({
  organizationId,
  members,
  invitations,
  caps,
}: {
  organizationId: string;
  members: TeamMemberView[];
  invitations: PendingInvitationView[];
  caps: TeamCapabilities;
}) {
  const router = useRouter();
  const toast = useToast();

  type InviteRole = "admin" | "member";
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>(
    (caps.assignableRoles[caps.assignableRoles.length - 1] as InviteRole) ?? "member",
  );
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [lastLink, setLastLink] = useState<{ email: string; link: string } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TeamMemberView | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);

  async function onInvite(event: React.FormEvent) {
    event.preventDefault();
    if (inviting) return;
    setInviteError(null);
    setInviting(true);
    const result = await createInvitationAction(organizationId, { email: email.trim(), role });
    setInviting(false);
    if (!result.ok) {
      setInviteError(result.error);
      return;
    }
    setEmail("");
    setLastLink(result.data ?? null);
    toast.success("Invitation created.");
    router.refresh();
  }

  async function onResend(id: string) {
    const result = await resendInvitationAction(organizationId, id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setLastLink(result.data ?? null);
    toast.success("Invitation refreshed.");
    router.refresh();
  }

  async function onRevoke(id: string) {
    const result = await revokeInvitationAction(organizationId, id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Invitation revoked.");
    router.refresh();
  }

  async function onChangeRole(membershipId: string, nextRole: OrgRole) {
    const result = await changeMemberRoleAction(organizationId, membershipId, nextRole);
    if (!result.ok) {
      toast.error(result.error);
      router.refresh();
      return;
    }
    toast.success("Role updated.");
    router.refresh();
  }

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied.");
    } catch {
      toast.error("Could not copy. Select and copy the link manually.");
    }
  }

  return (
    <>
      {caps.canInvite ? (
        <section className="fj-app-section">
          <div className="fj-app-section__head">
            <h2 className="fj-app-section__title">Invite a teammate</h2>
            <p className="fj-app-section__desc">
              Email delivery is not connected yet, so share the invite link
              directly. It expires in seven days and only works for the invited
              address.
            </p>
          </div>
          <div className="fj-app-section__body">
            <form className="fj-invite-form" onSubmit={onInvite} noValidate>
              <div className="fj-field" style={{ flex: 2 }}>
                <label htmlFor="invite-email">Email</label>
                <input
                  id="invite-email"
                  className="fj-input"
                  type="email"
                  value={email}
                  required
                  placeholder="teammate@example.com"
                  aria-invalid={inviteError ? true : undefined}
                  onChange={(e) => { setEmail(e.target.value); setInviteError(null); }}
                />
              </div>
              <div className="fj-field" style={{ flex: 1 }}>
                <label htmlFor="invite-role">Role</label>
                <select
                  id="invite-role"
                  className="fj-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value as InviteRole)}
                >
                  {caps.assignableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <BrandButton type="submit" disabled={inviting}>
                {inviting ? "Creating..." : "Create invite"}
              </BrandButton>
            </form>
            {inviteError ? (
              <p className="fj-field__error" role="alert" style={{ marginTop: "var(--space-2)" }}>
                {inviteError}
              </p>
            ) : null}
            {lastLink ? (
              <div className="fj-invite-link" role="status">
                <span>
                  Invite link for <strong>{lastLink.email}</strong>
                </span>
                <code>{lastLink.link}</code>
                <BrandButton size="sm" variant="secondary" onClick={() => copyLink(lastLink.link)}>
                  Copy link
                </BrandButton>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="fj-app-section">
        <div className="fj-app-section__head">
          <h2 className="fj-app-section__title">Members</h2>
          <p className="fj-app-section__desc">
            {members.length} {members.length === 1 ? "person" : "people"} in this
            organization.
          </p>
        </div>
        <div className="fj-app-section__body" style={{ overflowX: "auto" }}>
          <table className="fj-table">
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Role</th>
                <th scope="col">Joined</th>
                {caps.canRemove ? <th scope="col"><span className="fj-visually-hidden">Actions</span></th> : null}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const editable =
                  caps.canChangeRole &&
                  member.role !== "owner" &&
                  !member.isYou &&
                  caps.assignableRoles.includes(member.role);
                return (
                  <tr key={member.membershipId}>
                    <td>
                      <div className="fj-member-cell">
                        <Avatar name={member.displayName} src={member.avatarUrl} size={34} />
                        <div>
                          <div className="fj-member-cell__name">
                            {member.displayName ?? "Invited teammate"}
                            {member.isYou ? <span className="fj-member-cell__email"> (you)</span> : null}
                          </div>
                          <div className="fj-member-cell__email">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {editable ? (
                        <select
                          className="fj-input fj-role-select"
                          value={member.role}
                          aria-label={`Role for ${member.displayName ?? member.email}`}
                          onChange={(e) => onChangeRole(member.membershipId, e.target.value as OrgRole)}
                        >
                          {caps.assignableRoles.map((r) => (
                            <option key={r} value={r}>
                              {r.charAt(0).toUpperCase() + r.slice(1)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <RoleBadge role={member.role} />
                      )}
                    </td>
                    <td>
                      <time dateTime={member.joinedAt}>{relativeTime(member.joinedAt)}</time>
                    </td>
                    {caps.canRemove ? (
                      <td style={{ textAlign: "right" }}>
                        {member.role !== "owner" && !member.isYou ? (
                          <button
                            type="button"
                            className="fj-icon-button"
                            aria-label={`Remove ${member.displayName ?? member.email}`}
                            onClick={() => setRemoveTarget(member)}
                          >
                            <BrandIcon name="trash" size={16} />
                          </button>
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {caps.canManageInvites ? (
        <section className="fj-app-section">
          <div className="fj-app-section__head">
            <h2 className="fj-app-section__title">Pending invitations</h2>
          </div>
          <div className="fj-app-section__body">
            {invitations.length === 0 ? (
              <EmptyState
                icon="team"
                title="No pending invitations"
                description="When you invite someone, their invitation shows here until they accept it."
              />
            ) : (
              <ul className="fj-invite-list">
                {invitations.map((invite) => (
                  <li key={invite.id} className="fj-invite-item">
                    <div>
                      <div className="fj-member-cell__name">{invite.email}</div>
                      <div className="fj-member-cell__email">
                        {invite.role} ·{" "}
                        {invite.isExpired
                          ? "Expired"
                          : `Expires ${relativeTime(invite.expiresAt)}`}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                      <BrandButton size="sm" variant="secondary" onClick={() => onResend(invite.id)}>
                        {invite.isExpired ? "Renew" : "Resend"}
                      </BrandButton>
                      <BrandButton size="sm" variant="ghost" onClick={() => onRevoke(invite.id)}>
                        Revoke
                      </BrandButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}

      {caps.canLeave ? (
        <section className="fj-app-section">
          <div className="fj-app-section__head">
            <h2 className="fj-app-section__title">Leave organization</h2>
            <p className="fj-app-section__desc">
              You will lose access to this organization. An owner can invite you
              back later.
            </p>
          </div>
          <div className="fj-app-section__body">
            <BrandButton className="fj-button--danger" onClick={() => setLeaveOpen(true)}>
              Leave organization
            </BrandButton>
          </div>
        </section>
      ) : null}

      <ConfirmDialog
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="Remove this member?"
        description={
          removeTarget
            ? `${removeTarget.displayName ?? removeTarget.email} will lose access to this organization. You can invite them again later.`
            : ""
        }
        confirmLabel="Remove member"
        destructive
        onConfirm={async () => {
          if (!removeTarget) return;
          const result = await removeMemberAction(organizationId, removeTarget.membershipId);
          if (!result.ok) throw new Error(result.error);
          toast.success("Member removed.");
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="Leave this organization?"
        description="You will lose access immediately. Owners must delete the organization instead of leaving."
        confirmLabel="Leave organization"
        destructive
        onConfirm={async () => {
          const result = await leaveOrganizationAction(organizationId);
          if (!result.ok) throw new Error(result.error);
          toast.success("You left the organization.");
          window.location.href = "/app";
        }}
      />
    </>
  );
}
