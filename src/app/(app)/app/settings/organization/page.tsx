import type { Metadata } from "next";

import { AppSection, OrgAvatar } from "@/components/app/ui";
import { OrgSettingsForm } from "@/components/app/forms/org-settings-form";
import { requireActiveContext } from "@/lib/app/page-context";
import { can } from "@/lib/auth/roles";
import { forbiddenRedirect } from "@/lib/app/guards";

export const metadata: Metadata = {
  title: "Organization settings",
  robots: { index: false, follow: false },
};

export default async function OrganizationSettingsPage() {
  const { membership } = await requireActiveContext();
  const org = membership.organization;
  if (!can(membership.role, "org:update")) forbiddenRedirect();

  return (
    <>
      <AppSection
        title="Organization"
        description="Identity and defaults for this organization."
      >
        <OrgSettingsForm
          organizationId={org.id}
          initialName={org.name}
          initialTimezone={org.default_timezone}
          initialSlug={org.slug}
        />
      </AppSection>

      <AppSection
        title="Logo"
        description="Shown on your status pages and in the organization switcher."
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <OrgAvatar name={org.name} src={org.logo_url} size={56} />
          <p className="fj-app-section__desc" style={{ margin: 0 }}>
            Logo upload is coming soon. For now, we show your initials.
          </p>
        </div>
      </AppSection>

      <AppSection
        title="Ownership"
        description="The owner controls billing, deletion, and who can manage the organization."
      >
        <dl className="fj-stat-list">
          <div>
            <dt>Your role</dt>
            <dd>{membership.role.charAt(0).toUpperCase() + membership.role.slice(1)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{org.status.replace(/_/g, " ")}</dd>
          </div>
        </dl>
      </AppSection>
    </>
  );
}
