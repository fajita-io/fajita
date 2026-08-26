import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NewOrganizationForm } from "@/components/app/new-organization-form";
import { parseSignupPlanParams } from "@/lib/auth/paid-signup-flow";
import { getCurrentProfile } from "@/lib/auth/context";
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
  searchParams: Promise<{
    plan?: string;
    interval?: string;
  }>;
}) {
  let profile;
  try {
    profile = await getCurrentProfile();
  } catch (error) {
    console.error("[new organization] profile load failed", error);
    redirect("/login");
  }
  if (!profile || profile.deleted_at) redirect("/login");

  let memberships;
  try {
    memberships = await listMemberships(profile.id);
  } catch (error) {
    console.error("[new organization] membership lookup failed", error);
    memberships = [];
  }
  const isFirst = memberships.length === 0;
  const params = await searchParams;
  const { plan, interval } = parseSignupPlanParams(params);

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
        defaultTimezone={profile.timezone}
        planKey={plan ?? undefined}
        interval={interval}
      />
    </div>
  );
}
