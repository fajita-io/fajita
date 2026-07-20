"use client";

import Script from "next/script";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import { bindGeniusSubmitHandler } from "@/lib/genius/client";
import { GENIUS_PROJECT_KEY, GENIUS_WIDGET_SRC } from "@/lib/genius/config";

/**
 * Loads the Genius feedback widget inside the authenticated app only.
 * Uses auto theme so the modal follows the user's light/dark preference.
 */
export function GeniusScript() {
  return (
    <Script
      id="genius-widget"
      src={GENIUS_WIDGET_SRC}
      strategy="afterInteractive"
      data-project={GENIUS_PROJECT_KEY}
      data-theme="auto"
      onLoad={() => {
        trackGoal(DataFastGoals.geniusWidgetReady);
        bindGeniusSubmitHandler();
      }}
    />
  );
}
