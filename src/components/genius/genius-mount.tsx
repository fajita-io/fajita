"use client";

import { geniusEnabled } from "@/lib/genius/config";
import { GeniusScript } from "@/components/genius/genius-script";
import { GeniusSync } from "@/components/genius/genius-sync";
import { GeniusTriggerListener } from "@/components/genius/genius-trigger-listener";

/**
 * Authenticated-app-only product feedback via Genius. Not mounted on marketing,
 * docs, auth, or status surfaces. Entry points live in the sidebar, account
 * menu, command palette, and support page.
 */
export function GeniusMount() {
  if (!geniusEnabled()) return null;

  return (
    <>
      <GeniusScript />
      <GeniusSync />
      <GeniusTriggerListener />
    </>
  );
}
