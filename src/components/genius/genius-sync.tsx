"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useApp } from "@/lib/app/app-context";
import {
  syncGeniusAccount,
  syncGeniusIdentity,
  syncGeniusRouteContext,
} from "@/lib/genius/client";
import { subscribeGeniusReady } from "@/lib/genius/ready";

/**
 * Keeps Genius identify, account, and route context aligned with the
 * authenticated app session. Re-runs when the widget script finishes loading.
 */
export function GeniusSync() {
  const pathname = usePathname();
  const { profile, activeOrg, billingPlanLabel } = useApp();

  useEffect(() => {
    const syncAll = () => {
      syncGeniusIdentity({
        userId: profile.id,
        email: profile.email,
        displayName: profile.displayName,
        orgRole: activeOrg?.role ?? null,
        planLabel: billingPlanLabel,
      });

      if (activeOrg) {
        syncGeniusAccount({
          organizationId: activeOrg.id,
          organizationName: activeOrg.name,
          planLabel: billingPlanLabel,
        });
      }

      syncGeniusRouteContext(pathname);
    };

    syncAll();
    return subscribeGeniusReady(syncAll);
  }, [
    profile.id,
    profile.email,
    profile.displayName,
    activeOrg?.role,
    activeOrg?.id,
    activeOrg?.name,
    billingPlanLabel,
    pathname,
  ]);

  return null;
}
