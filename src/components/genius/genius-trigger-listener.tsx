"use client";

import { useEffect } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import type { GeniusOpenSource } from "@/lib/genius/client";

const SOURCE_ATTR = "data-genius-source";

function sourceFromElement(el: Element): GeniusOpenSource {
  const raw = el.getAttribute(SOURCE_ATTR);
  if (
    raw === "floating" ||
    raw === "command_palette" ||
    raw === "account_menu" ||
    raw === "inline" ||
    raw === "button" ||
    raw === "support_page"
  ) {
    return raw;
  }
  return "button";
}

/**
 * Tracks opens from declarative `data-genius-open` triggers inside the app
 * shell. Genius handles the actual modal; we only record analytics.
 */
export function GeniusTriggerListener() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest("[data-genius-open]");
      if (!trigger || !trigger.closest(".fj-app")) return;

      const category = trigger.getAttribute("data-genius-category");
      trackGoal(DataFastGoals.geniusOpened, {
        source: sourceFromElement(trigger),
        ...(category === "idea" ||
        category === "confusion" ||
        category === "bug" ||
        category === "praise"
          ? { category }
          : {}),
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
