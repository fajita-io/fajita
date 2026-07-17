"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton, BrandButtonLink } from "@/components/design-system/primitives";
import { acceptInvitationAction } from "@/lib/app/actions/team";
import { switchOrganizationAction } from "@/lib/app/actions/org";
import type { OrgRole } from "@/lib/auth/roles";

export function InviteAccept({
  token,
  organizationName,
  invitedEmail,
  yourEmail,
  isExpired,
  isConsumed,
  emailMatches,
}: {
  token: string;
  organizationName: string;
  invitedEmail: string;
  yourEmail: string | null;
  role: OrgRole;
  isExpired: boolean;
  isConsumed: boolean;
  emailMatches: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isConsumed) {
    return (
      <>
        <p className="fj-form-status fj-form-status--error">
          This invitation has already been used or revoked.
        </p>
        <BrandButtonLink href="/app">Go to your workspace</BrandButtonLink>
      </>
    );
  }

  if (isExpired) {
    return (
      <>
        <p className="fj-form-status fj-form-status--error">
          This invitation has expired. Ask for a fresh one.
        </p>
        <BrandButtonLink href="/app">Go to your workspace</BrandButtonLink>
      </>
    );
  }

  if (!emailMatches) {
    return (
      <p className="fj-form-status fj-form-status--error">
        This invitation is for <strong>{invitedEmail}</strong>. You are signed in
        as {yourEmail ?? "another account"}. Sign in with the invited email to
        accept.
      </p>
    );
  }

  async function onAccept() {
    if (pending) return;
    setError(null);
    setPending(true);
    const result = await acceptInvitationAction(token);
    if (!result.ok) {
      setPending(false);
      setError(result.error);
      return;
    }
    if (result.data?.organizationId) {
      await switchOrganizationAction(result.data.organizationId).catch(() => {});
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <>
      {error ? (
        <p className="fj-form-status fj-form-status--error" role="alert">
          {error}
        </p>
      ) : null}
      <BrandButton onClick={onAccept} disabled={pending}>
        {pending ? "Joining..." : `Join ${organizationName}`}
      </BrandButton>
    </>
  );
}
