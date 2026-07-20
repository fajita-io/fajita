"use client";

import type { ReactNode } from "react";

import type { GeniusOpenSource } from "@/lib/genius/client";
import type { GeniusCategory } from "@/lib/genius/types";

export function GeniusTriggerButton({
  children = "Got a genius idea?",
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
