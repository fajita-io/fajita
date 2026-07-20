import type { Metadata } from "next";

import { NewOrganizationForm } from "@/components/app/new-organization-form";
import { parseSignupPlanParams } from "@/lib/auth/paid-signup-flow";
import { requireAuthenticatedUser } from "@/lib/auth/context";
import { listMemberships } from "@/lib/app/organizations";

export const metadata: Metadata = {
  title: "Create your organization",
  robots: { index: false, follow: false },
};

function suggestName(displayName: string | null, email: string | null): string {
  if (displayName) {
    const first = displayName.trim().split(/\s+/)[0];
    if (first) return `${first}'s team`;
  }
  if (email) {
    const local = email.split("@")[0];
    if (local) return `${local}'s team`;
  }
  return "My team";
}

export default async function NewOrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; interval?: string }>;
}) {
  const profile = await requireAuthenticatedUser();
  const memberships = await listMemberships(profile.id);
  const isFirst = memberships.length === 0;
  const { plan, interval } = parseSignupPlanParams(await searchParams);

  return (
    <div className="fj-flow__card">
      <ol className="fj-flow__steps" aria-hidden="true">
        <li className="fj-flow__step" data-active />
        <li className="fj-flow__step" />
        <li className="fj-flow__step" />
      </ol>
      <h1 className="fj-flow__title">
        {isFirst ? "Name your organization" : "Add an organization"}
      </h1>
      <p className="fj-flow__lede">
        {isFirst
          ? "Step 1 of 3. Your organization holds monitors, team access, and status pages. Next you choose a plan and pay."
          : "This gives you a separate space for a different product or client, with its own team and settings."}
      </p>
      <NewOrganizationForm
        suggestedName={suggestName(profile.display_name, profile.primary_email)}
        planKey={plan}
        interval={interval}
      />
    </div>
  );
}
