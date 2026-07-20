import { publicClaims } from "@/lib/site/claims";

import { containsEmDash } from "./render-safe";
import type { SupportAnswer } from "./types";

export interface ValidationFailure {
  code: string;
  detail: string;
}

const FORBIDDEN_PHRASES = [
  /as an ai/i,
  /based on my training/i,
  /i completely understand/i,
  /rest assured/i,
  /seamlessly/i,
  /supercharge/i,
  /unlock/i,
  /24\/7\s+human/i,
  /reply in \d+\s+minutes/i,
  /guaranteed/i,
  /soc\s*2/i,
  /i have (already )?(canceled|resolved|refunded|approved)/i,
];

export function validateSupportAnswer(answer: SupportAnswer): ValidationFailure[] {
  const failures: ValidationFailure[] = [];
  const text = [
    answer.directAnswer,
    answer.explanation ?? "",
    ...(answer.steps ?? []),
  ].join("\n");

  if (containsEmDash(text)) {
    failures.push({ code: "em_dash", detail: "Customer-facing answer contains an em or en dash." });
  }
  for (const re of FORBIDDEN_PHRASES) {
    if (re.test(text)) {
      failures.push({ code: "forbidden_phrase", detail: `Matched ${re}` });
    }
  }

  if (/sms|phone alert|phone-call/i.test(text) && /support(s|ed)?/i.test(text)) {
    const smsClaim = publicClaims.find((c) => c.id === "alert-sms");
    if (smsClaim && smsClaim.status !== "available-now" && smsClaim.status !== "included") {
      if (!/does not currently support sms/i.test(text)) {
        failures.push({
          code: "unsupported_feature_claim",
          detail: "Answer appears to claim SMS support.",
        });
      }
    }
  }

  for (const source of answer.sources) {
    if (!source.url || source.url.includes("://") && !source.url.startsWith("https://")) {
      // relative ok; non-https absolute not ok
      if (source.url.includes("://")) {
        failures.push({ code: "unsafe_source", detail: source.url });
      }
    }
    if (!source.title.trim()) {
      failures.push({ code: "empty_source_title", detail: source.sourceId });
    }
  }

  if (answer.confidence === "high" && answer.sources.length === 0) {
    failures.push({ code: "high_without_sources", detail: "High confidence requires citations." });
  }

  return failures;
}

export function safeFallbackAnswer(reason: string): SupportAnswer {
  return {
    directAnswer:
      "I could not verify that from Fajita’s current support sources. Open the related documentation or send this conversation to support.",
    explanation: reason,
    sources: [
      {
        sourceId: "docs:index",
        title: "Documentation",
        sourceType: "documentation_page",
        url: "/docs",
      },
    ],
    nextAction: {
      label: "Send to Fajita support",
      href: "/support",
      kind: "handoff",
    },
    confidence: "insufficient_evidence",
    offerHandoff: true,
    handoffReason: "validation_failed",
    intent: "unknown",
  };
}
