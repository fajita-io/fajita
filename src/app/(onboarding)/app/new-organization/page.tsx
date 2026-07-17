import type { Metadata } from "next";

import { NewOrganizationForm } from "@/components/app/new-organization-form";
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

export default async function NewOrganizationPage() {
  const profile = await requireAuthenticatedUser();
  const memberships = await listMemberships(profile.id);
  const isFirst = memberships.length === 0;

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
          ? "An organization holds your monitors, team, and status pages. You can create more later, and switch between them anytime."
          : "This gives you a separate space for a different product or client, with its own team and settings."}
      </p>
      <NewOrganizationForm
        suggestedName={suggestName(profile.display_name, profile.primary_email)}
      />
    </div>
  );
}
