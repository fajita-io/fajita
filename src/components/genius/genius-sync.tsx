"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useApp } from "@/lib/app/app-context";
import {
  syncGeniusAccount,
  syncGeniusIdentity,
  syncGeniusRouteContext,
} from "@/lib/genius/client";

/**
 * Keeps Genius identify, account, and route context aligned with the
 * authenticated app session. Safe before the script finishes loading.
 */
export function GeniusSync() {
  const pathname = usePathname();
  const { profile, activeOrg, billingPlanLabel } = useApp();

  useEffect(() => {
    syncGeniusIdentity({
      userId: profile.id,
      email: profile.email,
      displayName: profile.displayName,
      orgRole: activeOrg?.role ?? null,
      planLabel: billingPlanLabel,
    });
  }, [
    profile.id,
    profile.email,
    profile.displayName,
    activeOrg?.role,
    billingPlanLabel,
  ]);

  useEffect(() => {
    if (!activeOrg) return;
    syncGeniusAccount({
      organizationId: activeOrg.id,
      organizationName: activeOrg.name,
      planLabel: billingPlanLabel,
    });
  }, [activeOrg?.id, activeOrg?.name, billingPlanLabel]);

  useEffect(() => {
    syncGeniusRouteContext(pathname);
  }, [pathname]);

  return null;
}
