import type { Metadata } from "next";

import { AppSection } from "@/components/app/ui";
import { ProfileForm } from "@/components/app/forms/profile-form";
import { requireAuthenticatedUser } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Profile settings",
  robots: { index: false, follow: false },
};

export default async function ProfileSettingsPage() {
  const profile = await requireAuthenticatedUser();

  return (
    <>
      <AppSection
        title="Your profile"
        description="How you appear across Fajita, and how we reach you."
      >
        <ProfileForm
          initial={{
            displayName: profile.display_name ?? "",
            timezone: profile.timezone,
            theme: profile.theme_preference as "light" | "dark" | "system",
            reducedMotion: profile.reduced_motion_preference as
              | "reduce"
              | "no-preference"
              | "system",
            productEmail: profile.product_email_preference,
            marketingEmail: profile.marketing_email_preference,
          }}
        />
      </AppSection>

      <AppSection title="Account identity">
        <dl className="fj-stat-list">
          <div>
            <dt>Email</dt>
            <dd>{profile.primary_email ?? "Not set"}</dd>
          </div>
          <div>
            <dt>Sign-in</dt>
            <dd>Managed by Clerk</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>
              {new Date(profile.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
        </dl>
        <p className="fj-app-section__desc" style={{ marginTop: "var(--space-4)" }}>
          Your email and password are managed securely by our sign-in provider.
          Change them from Security settings.
        </p>
      </AppSection>
    </>
  );
}
