"use client";

import { useEffect } from "react";

import { openGeniusFeedback } from "@/lib/genius/client";
import type { GeniusCategory } from "@/lib/genius/types";

const SOURCE_ATTR = "data-genius-source";

function sourceFromElement(el: Element) {
  const raw = el.getAttribute(SOURCE_ATTR);
  if (
    raw === "floating" ||
    raw === "sidebar" ||
    raw === "command_palette" ||
    raw === "account_menu" ||
    raw === "inline" ||
    raw === "button" ||
    raw === "support_page"
  ) {
    return raw;
  }
  return "button" as const;
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
 * Opens the Fajita feedback dialog for declarative `data-genius-open`
 * triggers and blocks the default Genius widget modal.
 */
export function GeniusTriggerListener() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest("[data-genius-open]");
      if (!trigger || !trigger.closest(".fj-app")) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      openGeniusFeedback({
        source: sourceFromElement(trigger),
        category: categoryFromElement(trigger),
        track: true,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
