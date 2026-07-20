"use client";

import type { ReactNode } from "react";

import type { GeniusOpenSource } from "@/lib/genius/client";
import { GENIUS_FEEDBACK_LABEL } from "@/lib/genius/config";
import type { GeniusCategory } from "@/lib/genius/types";

export function GeniusTriggerButton({
  children = GENIUS_FEEDBACK_LABEL,
  source = "button",
  category,
  className,
}: {
  children?: ReactNode;
  source?: GeniusOpenSource;
  category?: GeniusCategory;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className ?? "fj-button fj-button--secondary"}
      data-genius-open
      data-genius-source={source}
      {...(category ? { "data-genius-category": category } : {})}
    >
      {children}
    </button>
  );
}
