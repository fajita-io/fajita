import type { ReactNode } from "react";

import "./status-page.css";

/**
 * Layout for the public status renderer. Intentionally minimal: the status page
 * is the calmest, most resilient Fajita surface. It ships only its own
 * stylesheet and renders server-side from the public snapshot, with no
 * authenticated application dependencies in the render path.
 */
export default function StatusLayout({ children }: { children: ReactNode }) {
  return children;
}
