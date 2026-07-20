"use client";

import type { ReactNode } from "react";

import type { GeniusOpenSource } from "@/lib/genius/client";
import type { GeniusCategory } from "@/lib/genius/types";

export function GeniusInlineTrigger({
  children = "Tell us what would make this better",
  source = "inline",
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
      className={className ?? "fj-genius-inline-trigger"}
      data-genius-open
      data-genius-source={source}
      {...(category ? { "data-genius-category": category } : {})}
    >
      {children}
    </button>
  );
}
