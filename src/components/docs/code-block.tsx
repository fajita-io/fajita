"use client";

import { useState } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";

/**
 * Code block with a copy button. The copied text is exactly the visible code,
 * with no hidden characters, redaction markers, or injected values. Long lines
 * scroll inside the block and never overflow the page on mobile.
 */
export function DocsCodeBlock({
  code,
  language,
  title,
}: {
  code: string;
  language: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      trackGoal(DataFastGoals.docsCodeCopied, { language });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure className="fj-docs-code">
      <div className="fj-docs-code__bar">
        <span className="fj-docs-code__title">{title ?? language}</span>
        <button
          type="button"
          className="fj-docs-code__copy"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="fj-code fj-docs-code__pre" tabIndex={0}>
        <code data-language={language}>{code}</code>
      </pre>
    </figure>
  );
}
