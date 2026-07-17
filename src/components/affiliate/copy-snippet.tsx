"use client";

import { useState } from "react";

import { BrandButton } from "@/components/design-system/primitives";
import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";

/**
 * A ready-to-use block of copy with a copy button. For multi-line marketing
 * snippets affiliates can paste into posts and emails. Tracks a non-identifying
 * "creative downloaded" goal on copy.
 */
export function CopySnippet({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      trackGoal(DataFastGoals.affiliateCreativeDownloaded);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fj-snippet">
      <div className="fj-snippet__head">
        <span className="fj-copyfield__label">{label}</span>
        <BrandButton type="button" variant="secondary" size="sm" onClick={onCopy}>
          {copied ? "Copied" : "Copy"}
        </BrandButton>
      </div>
      <textarea className="fj-input fj-snippet__text" value={value} readOnly rows={3} />
    </div>
  );
}
