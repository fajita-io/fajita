"use client";

import { geniusEnabled } from "@/lib/genius/config";
import { GeniusFloatingTrigger } from "@/components/genius/genius-floating-trigger";
import { GeniusScript } from "@/components/genius/genius-script";
import { GeniusSync } from "@/components/genius/genius-sync";
import { GeniusTriggerListener } from "@/components/genius/genius-trigger-listener";

/**
 * Authenticated-app-only Genius feedback capture. Not mounted on marketing,
 * docs, auth, or status surfaces.
 */
export function GeniusMount() {
  if (!geniusEnabled()) return null;

  return (
    <>
      <GeniusScript />
      <GeniusSync />
      <GeniusTriggerListener />
      <GeniusFloatingTrigger />
    </>
  );
}
