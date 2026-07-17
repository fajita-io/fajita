import type { ReactNode } from "react";

import type { CalloutKind } from "@/lib/docs/blocks";

const CALLOUT_LABELS: Record<CalloutKind, string> = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
  security: "Security",
  plan: "Plan requirement",
  beta: "Beta",
  deprecated: "Deprecated",
};

/**
 * Callout with a non-color signal (a text label and an icon glyph) so meaning
 * does not depend on color alone.
 */
export function DocsCallout({
  variant,
  title,
  children,
}: {
  variant: CalloutKind;
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className={`fj-docs-callout fj-docs-callout--${variant}`} role="note">
      <p className="fj-docs-callout__label">{title ?? CALLOUT_LABELS[variant]}</p>
      <div className="fj-docs-callout__body">{children}</div>
    </aside>
  );
}
