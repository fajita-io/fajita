"use client";

import { FajitaMark } from "@/components/brand/logo/fajita-mark";
import { Tooltip } from "@/components/design-system/primitives";

/**
 * Primary in-app feedback entry. Uses the Fajita mark at nav icon size so it
 * aligns pixel-for-pixel with sidebar destinations.
 */
export function GeniusSidebarTrigger({ collapsed }: { collapsed: boolean }) {
  const button = (
    <button
      type="button"
      className="fj-sidenav__link fj-sidenav__link--feedback"
      data-genius-open
      data-genius-source="sidebar"
      aria-haspopup="dialog"
      aria-label="Share product feedback"
    >
      <span className="fj-sidenav__icon" aria-hidden="true">
        <FajitaMark size={18} label="" tone="auto" />
      </span>
      {!collapsed ? (
        <span className="fj-sidenav__label">Share feedback</span>
      ) : null}
    </button>
  );

  if (collapsed) {
    return <Tooltip content="Share feedback">{button}</Tooltip>;
  }

  return button;
}
