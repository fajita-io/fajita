"use client";

import { useState } from "react";

import { BrandButton } from "@/components/design-system/primitives";

/**
 * Read-only value with a copy button. Honest feedback: it confirms the copy and
 * resets, and never claims success it cannot verify (falls back to select-all).
 */
export function CopyField({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fj-copyfield">
      {label ? <span className="fj-copyfield__label">{label}</span> : null}
      <div className="fj-copyfield__row">
        <input className="fj-input fj-copyfield__input" value={value} readOnly />
        <BrandButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCopy}
        >
          {copied ? "Copied" : "Copy"}
        </BrandButton>
      </div>
    </div>
  );
}
