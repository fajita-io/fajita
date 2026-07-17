import type { ConversationMode, PageContext } from "./types";

export function suggestedPromptsFor(
  mode: ConversationMode,
  page?: PageContext,
): string[] {
  const area = page?.productArea ?? "";
  const route = page?.route ?? "";

  if (route.includes("/pricing") || area === "billing") {
    return [
      "Which plan supports one-minute checks?",
      "Can I use a custom domain?",
      "What happens if payment fails?",
      "Is there a free plan?",
    ];
  }
  if (route.includes("/docs") || area === "docs") {
    return [
      "How do I create my first monitor?",
      "Why was my destination blocked?",
      "How do webhook signatures work?",
      "How do I connect Slack?",
    ];
  }
  if (route.includes("/monitors/") || area === "monitors") {
    return [
      "Why did the latest check fail?",
      "Why is there no incident?",
      "How does retry work?",
      "What should I check next?",
    ];
  }
  if (route.includes("/incidents/") || area === "incidents") {
    return [
      "Why did this incident open?",
      "Has recovery been confirmed?",
      "Is this incident public?",
      "Where were alerts sent?",
    ];
  }
  if (route.includes("/status-pages") || area === "status-pages") {
    return [
      "Why is this component degraded?",
      "Is the custom domain active?",
      "Why is the page stale?",
      "Are subscriber emails enabled?",
    ];
  }
  if (mode === "authenticated") {
    return [
      "Why did the latest check fail?",
      "What is our current plan limit?",
      "How do I connect Slack?",
      "How do I publish a status page?",
    ];
  }
  return [
    "What does Fajita monitor?",
    "How does incident verification work?",
    "Which plan fits a small SaaS?",
    "Can I publish a custom status page?",
  ];
}
