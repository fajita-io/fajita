import type { Metadata } from "next";

import { AppSection } from "@/components/app/ui";
import { PreferencesForm } from "@/components/app/forms/preferences-form";
import { ReopenChecklistButton } from "@/components/app/onboarding/activation-checklist";
import { requireActiveContext } from "@/lib/app/page-context";
import { getPreferences, PREFERENCE_DEFAULTS } from "@/lib/app/preferences";
import { serviceClient } from "@/lib/supabase/service";

export const metadata: Metadata = {
  title: "Preferences",
  robots: { index: false, follow: false },
};

export default async function PreferencesSettingsPage() {
  const { profile, membership } = await requireActiveContext();
  const prefs = (await getPreferences(profile.id)) ?? {
    user_id: profile.id,
    created_at: "",
    updated_at: "",
    ...PREFERENCE_DEFAULTS,
  };

  const { data: onboardingRow } = await serviceClient()
    .from("organization_onboarding")
    .select("checklist_dismissed_at")
    .eq("organization_id", membership.organization.id)
    .maybeSingle();
  const checklistDismissed = Boolean(onboardingRow?.checklist_dismissed_at);

  return (
    <>
      <AppSection
        title="Preferences"
        description="How dates, times, and the app behave for you. These are stored on your account and follow you across devices. Theme and motion live in your profile."
      >
        <PreferencesForm
          initial={{
            dateFormat: prefs.date_format as never,
            timeFormat: prefs.time_format as never,
            weekStart: prefs.week_start as never,
            defaultLanding: prefs.default_landing as never,
            chartDensity: prefs.chart_density as never,
          }}
        />
      </AppSection>

      {checklistDismissed ? (
        <AppSection
          title="Setup checklist"
          description="The checklist was hidden from the overview page. Bring it back anytime."
        >
          <ReopenChecklistButton organizationId={membership.organization.id} />
        </AppSection>
      ) : null}
    </>
  );
}
