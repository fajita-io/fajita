import type { Metadata } from "next";
import Link from "next/link";

import { AppSection } from "@/components/app/ui";
import { NotificationPrefsForm } from "@/components/app/forms/notification-prefs-form";
import { LifecyclePrefsForm } from "@/components/app/forms/lifecycle-prefs-form";
import { requireAuthenticatedUser } from "@/lib/auth/context";
import { getNotificationPreferences } from "@/lib/app/notification-prefs";
import {
  getLifecyclePreferences,
  getSuppressionState,
} from "@/lib/lifecycle/preferences";

export const metadata: Metadata = {
  title: "Notification preferences",
  robots: { index: false, follow: false },
};

export default async function NotificationSettingsPage() {
  const profile = await requireAuthenticatedUser();
  const [prefs, lifecyclePrefs, suppression] = await Promise.all([
    getNotificationPreferences(profile.id),
    getLifecyclePreferences(profile.id),
    getSuppressionState(profile.id),
  ]);

  return (
    <>
      <AppSection
        title="Product email"
        description="Setup guidance, reports, and recaps from Fajita about your organizations. Team incident alerts and public status page subscriptions are managed separately."
      >
        <LifecyclePrefsForm
          initial={{
            setup_guidance: lifecyclePrefs.setup_guidance,
            weekly_report: lifecyclePrefs.weekly_report,
            incident_recaps: lifecyclePrefs.incident_recaps,
            usage_notices: lifecyclePrefs.usage_notices,
            reactivation_reminders: lifecyclePrefs.reactivation_reminders,
          }}
          suppressed={suppression.suppressed}
        />
        <p className="fj-app-section__desc" style={{ marginTop: "var(--space-3)" }}>
          <Link className="fj-link-button" href="/app/settings/notifications/history">
            View recent email delivery
          </Link>
        </p>
      </AppSection>

      <AppSection
        title="Product news"
        description="Announcements and education about Fajita itself."
      >
        <NotificationPrefsForm
          initial={{
            productUpdates: prefs?.product_updates ?? true,
            changelogDigest: prefs?.changelog_digest ?? false,
            featureAnnouncements: prefs?.feature_announcements ?? true,
            education: prefs?.education ?? true,
            marketing: prefs?.marketing ?? false,
          }}
        />
      </AppSection>
    </>
  );
}
