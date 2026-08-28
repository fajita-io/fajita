import type { ContentBlock } from "@/lib/docs/blocks";
import { blocksToMarkdown } from "@/lib/docs/serialize";
import type { ContentArticle } from "@/lib/content/types";
import type { FaqItem } from "@/lib/site/faq";
import type { PublicPlan } from "@/lib/site/pricing";

export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function stripInlineMarkup(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function extractHowToSteps(body: ContentBlock[]): { name: string; text: string }[] {
  const stepsBlock = body.find((block) => block.kind === "steps");
  if (stepsBlock?.kind === "steps") {
    return stepsBlock.items.map((item) => ({
      name: item.title,
      text: stripInlineMarkup(blocksToMarkdown(item.body)).trim(),
    }));
  }

  const sections: { name: string; text: string }[] = [];
  let currentName: string | null = null;
  let currentParts: string[] = [];

  const flush = () => {
    if (!currentName) return;
    const text = currentParts.join("\n").trim();
    if (text) sections.push({ name: currentName, text });
    currentName = null;
    currentParts = [];
  };

  for (const block of body) {
    if (block.kind === "heading" && block.level === 2) {
      flush();
      currentName = block.text;
      continue;
    }
    if (!currentName) continue;
    if (block.kind === "paragraph" || block.kind === "list") {
      currentParts.push(stripInlineMarkup(blocksToMarkdown([block])).trim());
    }
  }
  flush();

  return sections
    .filter((section) => !/^(what|why|when|who)\b/i.test(section.name))
    .slice(0, 12)
    .map((section, index) => ({
      name: section.name || `Step ${index + 1}`,
      text: section.text,
    }));
}

export function buildHowToJsonLd(article: ContentArticle, pageUrl: string) {
  const steps = extractHowToSteps(article.body);
  if (steps.length < 2) return null;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: article.meta.title,
    description: article.meta.description,
    url: pageUrl,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function buildPricingJsonLd(siteUrl: string, plans: PublicPlan[]) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Fajita Cloud",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/pricing`,
    offers: plans
      .filter((plan) => plan.monthlyUsd !== null)
      .map((plan) => ({
        "@type": "Offer",
        name: `${plan.name} plan`,
        price: plan.monthlyUsd,
        priceCurrency: "USD",
        url: `${siteUrl}/pricing`,
        availability: "https://schema.org/InStock",
        description: `${plan.checksLabel} checks per month, ${plan.monitorLimit ?? "unlimited"} monitors`,
      })),
  };
}
