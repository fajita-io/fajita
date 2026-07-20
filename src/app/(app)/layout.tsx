import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { sidebarInitScript } from "@/lib/app/sidebar-script";
import { AccountStateScreen } from "@/components/app/account-state-screen";
import type { AppContextValue } from "@/lib/app/app-context";
import { getCurrentProfile, isPlatformAdmin } from "@/lib/auth/context";
import { permissionsFor } from "@/lib/auth/roles";
import { listMemberships, resolveActiveOrg } from "@/lib/app/organizations";
import { readActiveOrgId } from "@/lib/app/active-org";
import { resolveFeatureMap } from "@/lib/app/feature-flags.server";
import { computeOrgBillingState } from "@/lib/billing/engine";
import { PLANS } from "@/lib/stripe/plans";
import { serviceClient } from "@/lib/supabase/service";

function billingPlanLabelFor(
  planKey: keyof typeof PLANS | null,
  isBetaGrant: boolean,
): string {
  if (planKey && planKey in PLANS) return PLANS[planKey].name;
  if (isBetaGrant) return "Beta";
  return "Free";
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.deleted_at) redirect("/login");
  if (profile.suspended_at) {
    return <AccountStateScreen kind="suspended" />;
  }

  const requestedOrgId = await readActiveOrgId();
  const [memberships, active, admin] = await Promise.all([
    listMemberships(profile.id),
    resolveActiveOrg(profile.id, requestedOrgId),
    isPlatformAdmin(),
  ]);

  // A brand-new account with no organization goes through the standalone
  // first-organization flow (its own minimal layout, so no redirect loop).
  if (memberships.length === 0) redirect("/app/new-organization");

  const [features, billingResult, notificationsResult] = await Promise.all([
    resolveFeatureMap(active?.organization.id ?? null),
    active
      ? computeOrgBillingState(active.organization.id).catch((error) => {
          console.error("[app layout] billing state failed", error);
          return null;
        })
      : Promise.resolve(null),
    serviceClient()
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .is("read_at", null)
      .then(({ count, error }) => {
        if (error) {
          console.error("[app layout] notifications count failed", error);
          return 0;
        }
        return count ?? 0;
      }),
  ]);

  const billing = billingResult;

  const context: AppContextValue = {
    profile: {
      id: profile.id,
      displayName: profile.display_name ?? "You",
      email: profile.primary_email,
      avatarUrl: profile.avatar_url,
    },
    activeOrg: active
      ? {
          id: active.organization.id,
          name: active.organization.name,
          slug: active.organization.slug,
          role: active.role,
          logoUrl: active.organization.logo_url,
        }
      : null,
    organizations: memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      role: m.role,
      logoUrl: m.organization.logo_url,
    })),
    permissions: active ? permissionsFor(active.role) : [],
    isPlatformAdmin: admin,
    features,
    unreadNotifications: notificationsResult,
    billingPlanLabel: billingPlanLabelFor(
      billing?.planKey ?? null,
      billing?.isBetaGrant ?? false,
    ),
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: sidebarInitScript }} />
      <AppShell context={context}>{children}</AppShell>
    </>
  );
}
