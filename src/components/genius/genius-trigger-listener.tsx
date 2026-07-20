"use client";

import { useEffect } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import {
  openGeniusFeedback,
  type GeniusOpenSource,
} from "@/lib/genius/client";
import type { GeniusCategory } from "@/lib/genius/types";

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

function categoryFromElement(el: Element): GeniusCategory | undefined {
  const raw = el.getAttribute("data-genius-category");
  if (
    raw === "idea" ||
    raw === "confusion" ||
    raw === "bug" ||
    raw === "praise"
  ) {
    return raw;
  }
  return undefined;
}

/**
 * Tracks opens from declarative `data-genius-open` triggers inside the app
 * shell. When a category is set, opens programmatically so context and
 * category reach Genius together.
 */
export function GeniusTriggerListener() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest("[data-genius-open]");
      if (!trigger || !trigger.closest(".fj-app")) return;

      const source = sourceFromElement(trigger);
      const category = categoryFromElement(trigger);

      if (category) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openGeniusFeedback({ source, category });
        return;
      }

      trackGoal(DataFastGoals.geniusOpened, { source });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
