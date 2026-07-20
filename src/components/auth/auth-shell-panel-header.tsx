"use client";

import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/design-system/theme-toggle";

/** Top bar on the auth form panel: theme control only on desktop; logo slot on mobile. */
export function AuthShellPanelHeader({
  mobileLogo,
}: {
  mobileLogo?: ReactNode;
}) {
  return (
    <div className="fj-authshell__panel-bar">
      <div className="fj-authshell__panel-bar-start">{mobileLogo}</div>
      <ThemeToggle />
    </div>
  );
}
