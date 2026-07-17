import type { Metadata } from "next";

import { InviteAccept } from "@/components/app/invite-accept";
import { peekInvitation } from "@/lib/app/invitations";
import { requireAuthenticatedUser } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Accept invitation",
  robots: { index: false, follow: false },
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const profile = await requireAuthenticatedUser();
  const invite = await peekInvitation(token);

  if (!invite) {
    return (
      <div className="fj-flow__card">
        <h1 className="fj-flow__title">This invitation is not valid.</h1>
        <p className="fj-flow__lede">
          The link may be out of date or already used. Ask whoever invited you to
          send a fresh one.
        </p>
      </div>
    );
  }

  const emailMatches =
    (profile.primary_email ?? "").toLowerCase() === invite.email.toLowerCase();

  return (
    <div className="fj-flow__card">
      <h1 className="fj-flow__title">Join {invite.organizationName}</h1>
      <p className="fj-flow__lede">
        You have been invited to join {invite.organizationName} as {invite.role}.
      </p>
      <InviteAccept
        token={token}
        organizationName={invite.organizationName}
        invitedEmail={invite.email}
        yourEmail={profile.primary_email}
        role={invite.role}
        isExpired={invite.isExpired}
        isConsumed={invite.isConsumed}
        emailMatches={emailMatches}
      />
    </div>
  );
}
