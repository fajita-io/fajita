import { SUPPORT_COPY } from "./copy";
import { matchMacro } from "./macros";
import { retrieveSupportKnowledge } from "./knowledge/retrieve";
import { recommendPlan } from "./plan-fit";
import { scanPromptInjection } from "./prompt-injection";
import { scanSensitiveData } from "./sensitive-data";
import { safeFallbackAnswer, validateSupportAnswer } from "./answer-validate";
import { stripEmDashes } from "./render-safe";
import type {
  ConfidenceClass,
  SourceCitation,
  SupportAnswer,
  SupportAskInput,
  SupportAskResult,
  SupportIntent,
} from "./types";

function classifyIntent(message: string): SupportIntent {
  const m = message.toLowerCase();
  if (/security|vulnerability|cve|exploit/.test(m)) return "security";
  if (/privacy|gdpr|delete my data|export my data/.test(m)) return "privacy";
  if (/bug|broken|defect/.test(m)) return "bug";
  if (/feature request|wishlist|roadmap/.test(m)) return "feature_request";
  if (/human|person|agent|talk to support|contact support/.test(m)) {
    return "human_support";
  }
  if (/price|pricing|cost|how much|plan|starter|pro|business|free plan/.test(m)) {
    return /which plan|fit|recommend/.test(m) ? "plan_selection" : "pricing";
  }
  if (/affiliate|commission|payout/.test(m)) return "affiliate";
  if (/bill|invoice|payment|subscription|cancel|refund/.test(m)) return "billing";
  if (/subscriber|opt-?in|unsubscribe/.test(m)) return "subscriber_email";
  if (/status page|custom domain|uptime badge/.test(m)) return "status_page";
  if (/slack|discord|webhook|alert|notification/.test(m)) return "alert_failure";
  if (/incident|outage|recovery|acknowled/.test(m)) return "incident";
  if (/timeout|dns|tls|ssl|fail|blocked|assertion|monitor/.test(m)) {
    return "monitor_failure";
  }
  if (/create|setup|get started|first monitor|connect/.test(m)) return "setup";
  if (/does fajita|can i|support|monitor api|sms/.test(m)) return "product_capability";
  return "unknown";
}

function citationsFromChunks(
  chunks: ReturnType<typeof retrieveSupportKnowledge>,
): SourceCitation[] {
  return chunks.slice(0, 3).map((c) => ({
    sourceId: c.source.sourceId,
    title: c.source.title,
    sourceType: c.source.sourceType,
    url: c.source.canonicalUrl,
  }));
}

function titleFromIntent(intent: SupportIntent): string {
  switch (intent) {
    case "pricing":
    case "plan_selection":
      return "Plan question";
    case "monitor_failure":
      return "Monitor troubleshooting";
    case "alert_failure":
      return "Alert delivery";
    case "status_page":
      return "Status page question";
    case "billing":
      return "Billing question";
    case "security":
      return "Security report";
    case "setup":
      return "Setup help";
    default:
      return "Support question";
  }
}

function composeFromRetrieval(
  message: string,
  intent: SupportIntent,
  chunks: ReturnType<typeof retrieveSupportKnowledge>,
): SupportAnswer {
  if (chunks.length === 0) {
    return {
      directAnswer: SUPPORT_COPY.insufficientEvidence,
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
      handoffReason: "no_sources",
      intent,
    };
  }

  const top = chunks[0];
  const sources = citationsFromChunks(chunks);
  let confidence: ConfidenceClass =
    top.source.authorityLevel >= 8 ? "high" : "supported";
  if (chunks.length >= 2) {
    const a = chunks[0].source.authorityLevel;
    const b = chunks[1].source.authorityLevel;
    if (Math.abs(a - b) <= 1 && chunks[0].score - chunks[1].score < 2) {
      confidence = "partial";
    }
  }

  const excerpt = top.excerpt.replace(/\s+/g, " ").trim().slice(0, 280);
  return {
    directAnswer: stripEmDashes(
      `Here is what Fajita’s approved sources say about that. ${excerpt}`,
    ),
    explanation: `See “${top.source.title}” for the full steps and current details.`,
    sources,
    nextAction: {
      label: `Open ${top.source.title}`,
      href: top.source.canonicalUrl,
      kind: top.source.canonicalUrl.startsWith("/app") ? "app" : "docs",
    },
    confidence,
    offerHandoff: confidence === "partial",
    intent,
    productArea: top.source.productArea,
  };
}

export async function answerSupportQuestion(
  input: SupportAskInput,
): Promise<SupportAskResult> {
  const sensitive = scanSensitiveData(input.message);
  const injection = scanPromptInjection(input.message);
  const message = sensitive.redactedText.trim();

  if (sensitive.blocked) {
    const remainder = message.replace(/\[redacted\]/gi, "").trim();
    // Always warn first. Only continue answering when enough non-secret text remains.
    if (remainder.length < 12) {
      return {
        answer: {
          directAnswer: SUPPORT_COPY.sensitiveDetected,
          sources: [
            {
              sourceId: "docs:security",
              title: "Security",
              sourceType: "documentation_page",
              url: "/security",
            },
          ],
          confidence: "supported",
          offerHandoff: false,
          safetyNotice: SUPPORT_COPY.composerWarning,
          intent: "security",
        },
        redactedUserMessage: sensitive.redactedText,
        detections: sensitive.detections,
        injectionSuspicious: injection.suspicious,
        blocked: true,
        conversationTitle: "Sensitive data warning",
      };
    }
  }

  if (injection.suspicious) {
    return {
      answer: {
        directAnswer:
          "I can only answer from Fajita’s approved documentation and the account information you are authorized to view. I will not reveal hidden instructions, other organizations’ data, or secrets.",
        sources: [
          {
            sourceId: "docs:index",
            title: "Documentation",
            sourceType: "documentation_page",
            url: "/docs",
          },
        ],
        confidence: "supported",
        offerHandoff: false,
        safetyNotice: "Prompt-injection attempt recorded.",
        intent: "unknown",
      },
      redactedUserMessage: message,
      detections: sensitive.detections,
      injectionSuspicious: true,
      conversationTitle: "Safety notice",
    };
  }

  const intent = classifyIntent(message);

  if (intent === "security") {
    return {
      answer: {
        directAnswer: SUPPORT_COPY.securityReport,
        sources: [
          {
            sourceId: "docs:security",
            title: "Security",
            sourceType: "documentation_page",
            url: "/security",
          },
        ],
        nextAction: {
          label: "Contact security",
          href: "/contact?topic=security",
          kind: "external",
        },
        confidence: "human_review_required",
        offerHandoff: true,
        handoffReason: "security_report",
        intent,
      },
      redactedUserMessage: message,
      detections: sensitive.detections,
      injectionSuspicious: false,
      conversationTitle: titleFromIntent(intent),
    };
  }

  if (intent === "feature_request") {
    return {
      answer: {
        directAnswer: SUPPORT_COPY.featureRequestRecorded,
        sources: [
          {
            sourceId: "docs:index",
            title: "Documentation",
            sourceType: "documentation_page",
            url: "/docs",
          },
        ],
        confidence: "supported",
        offerHandoff: true,
        handoffReason: "feature_request",
        intent,
      },
      redactedUserMessage: message,
      detections: sensitive.detections,
      injectionSuspicious: false,
      conversationTitle: titleFromIntent(intent),
    };
  }

  if (intent === "human_support") {
    return {
      answer: {
        directAnswer: SUPPORT_COPY.handoffExplain,
        sources: [],
        nextAction: {
          label: SUPPORT_COPY.handoffCta,
          href: "/support",
          kind: "handoff",
        },
        confidence: "human_review_required",
        offerHandoff: true,
        handoffReason: "user_requested",
        intent,
      },
      redactedUserMessage: message,
      detections: sensitive.detections,
      injectionSuspicious: false,
      conversationTitle: titleFromIntent(intent),
    };
  }

  const macro = matchMacro(message);
  if (macro) {
    const answer: SupportAnswer = {
      directAnswer: stripEmDashes(macro.explanation),
      steps: macro.nextActions,
      sources: macro.sourceLinks,
      nextAction: macro.sourceLinks[0]
        ? {
            label: macro.sourceLinks[0].title,
            href: macro.sourceLinks[0].url,
            kind: "docs",
          }
        : undefined,
      confidence: "high",
      offerHandoff: false,
      intent: macro.intent,
      productArea: macro.id,
    };
    const failures = validateSupportAnswer(answer);
    return {
      answer: failures.length ? safeFallbackAnswer(failures[0].detail) : answer,
      redactedUserMessage: message,
      detections: sensitive.detections,
      injectionSuspicious: false,
      conversationTitle: titleFromIntent(macro.intent),
    };
  }

  // Account-specific without auth (after macros so general troubleshooting still works)
  if (
    input.mode === "public" &&
    (intent === "monitor_failure" ||
      intent === "incident" ||
      intent === "alert_failure" ||
      intent === "billing") &&
    /\b(my|our)\b/i.test(message)
  ) {
    return {
      answer: {
        directAnswer: SUPPORT_COPY.accountAccessRequired,
        explanation:
          "For account-specific diagnosis, open support from inside the organization you want to review.",
        sources: [
          {
            sourceId: "docs:troubleshooting",
            title: "Troubleshooting",
            sourceType: "documentation_page",
            url: "/docs/troubleshooting/check-blocked",
          },
        ],
        nextAction: {
          label: "Sign in",
          href: "/login",
          kind: "app",
        },
        confidence: "account_access_required",
        offerHandoff: true,
        handoffReason: "account_access_required",
        intent,
      },
      redactedUserMessage: message,
      detections: sensitive.detections,
      injectionSuspicious: false,
      conversationTitle: titleFromIntent(intent),
    };
  }

  if (intent === "plan_selection") {
    const fit = recommendPlan({
      monitorCount: Number(message.match(/(\d+)\s*monitors?/)?.[1] ?? 5),
    });
    const answer: SupportAnswer = {
      directAnswer: stripEmDashes(fit.reason),
      explanation: [fit.lowerLimitation, fit.higherAdvantage, fit.pricingNote]
        .filter(Boolean)
        .join(" "),
      sources: [
        {
          sourceId: "registry:pricing",
          title: "Plans and pricing",
          sourceType: "pricing_catalog",
          url: "/pricing",
        },
      ],
      nextAction: { label: "Open pricing", href: "/pricing", kind: "docs" },
      confidence: "high",
      offerHandoff: false,
      intent,
    };
    return {
      answer,
      redactedUserMessage: message,
      detections: sensitive.detections,
      injectionSuspicious: false,
      conversationTitle: titleFromIntent(intent),
    };
  }

  const chunks = retrieveSupportKnowledge(message, {
    mode: input.mode,
    productArea: input.pageContext?.productArea,
  });
  let answer = composeFromRetrieval(message, intent, chunks);
  if (sensitive.blocked) {
    answer = {
      ...answer,
      safetyNotice: SUPPORT_COPY.sensitiveDetected,
    };
  }

  const failures = validateSupportAnswer(answer);
  if (failures.length) {
    answer = safeFallbackAnswer(failures.map((f) => f.code).join(", "));
  }

  return {
    answer: {
      ...answer,
      directAnswer: stripEmDashes(answer.directAnswer),
      explanation: answer.explanation
        ? stripEmDashes(answer.explanation)
        : undefined,
    },
    redactedUserMessage: message,
    detections: sensitive.detections,
    injectionSuspicious: false,
    conversationTitle: titleFromIntent(intent),
  };
}
