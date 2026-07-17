import { PageHeader, AppSection } from "@/components/app/ui";
import { BrandButtonLink } from "@/components/design-system/primitives";
import {
  ClosureForm,
  EmailPreferencesForm,
  ProfileForm,
} from "@/components/affiliate/settings-forms";
import { requireAffiliate } from "@/lib/affiliates/context";
import { affiliateCan } from "@/lib/affiliates/permissions";
import { getAffiliateProfile, getEmailPreferences } from "@/lib/affiliates/profile";
import type { MembershipState } from "@/lib/affiliates/states";

export const dynamic = "force-dynamic";

export default async function AffiliateSettingsPage() {
  const { affiliate } = await requireAffiliate();
  const state = affiliate.membership_state as MembershipState;
  const canUpdate = affiliateCan(state, "affiliate.profile.update");
  const canExport = affiliateCan(state, "affiliate.export");
  const canClose = state === "active" || state === "paused";

  const [profile, prefs] = await Promise.all([
    getAffiliateProfile(affiliate.id),
    getEmailPreferences(affiliate.id),
  ]);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your profile, your email preferences, and account controls."
      />

      <AppSection
        title="Profile"
        description="How we reach you. Your contact email is where program mail goes."
      >
        <ProfileForm initial={profile} readOnly={!canUpdate} />
      </AppSection>

      <AppSection
        title="Email preferences"
        description="Choose which optional emails you get. Account messages always send."
      >
        <EmailPreferencesForm initial={prefs} readOnly={!canUpdate} />
      </AppSection>

      {canExport ? (
        <AppSection
          title="Export"
          description="Download your commissions and payout statements as CSV."
        >
          <div className="fj-payout-setup__actions">
            <BrandButtonLink
              variant="secondary"
              href="/affiliate/export?kind=commissions"
            >
              Export commissions
            </BrandButtonLink>
            <BrandButtonLink
              variant="secondary"
              href="/affiliate/export?kind=statements"
            >
              Export statements
            </BrandButtonLink>
          </div>
        </AppSection>
      ) : null}

      {canClose ? (
        <AppSection
          title="Close account"
          description="End your participation in the program."
        >
          <ClosureForm />
        </AppSection>
      ) : null}
    </>
  );
}
