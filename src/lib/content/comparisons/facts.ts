import { competitorFactSchema, type CompetitorFact } from "../schema";

/**
 * Dated competitor-fact registry. Unknown values stay unknown.
 * Prices and limits require fresh verification before comparison publish.
 *
 * Launch comparisons that need current pricing mark pricingStatus as
 * link-only or unknown rather than guessing.
 */

const rawFacts: CompetitorFact[] = [
  {
    id: "uptimerobot-has-free-tier",
    competitor: "UptimeRobot",
    productArea: "pricing",
    fact: "UptimeRobot publicly advertises a free monitoring plan on its pricing page.",
    sourceUrl: "https://uptimerobot.com/pricing/",
    sourceType: "official-pricing",
    dateVerified: "2026-07-17",
    reviewer: "content-editorial",
    confidence: "high",
    expirationReviewDate: "2026-10-17",
    notes: "Exact monitor limits and intervals change; confirm on official page before quoting numbers.",
    public: true,
    usedByPages: ["fajita-vs-uptimerobot"],
  },
  {
    id: "uptimerobot-status-pages-exist",
    competitor: "UptimeRobot",
    productArea: "status-pages",
    fact: "UptimeRobot offers status pages as part of its product line.",
    sourceUrl: "https://uptimerobot.com/",
    sourceType: "official-marketing",
    dateVerified: "2026-07-17",
    reviewer: "content-editorial",
    confidence: "high",
    expirationReviewDate: "2026-10-17",
    public: true,
    usedByPages: ["fajita-vs-uptimerobot"],
  },
  {
    id: "betterstack-uptime-product",
    competitor: "Better Stack",
    productArea: "monitoring",
    fact: "Better Stack markets uptime monitoring and status pages as core products.",
    sourceUrl: "https://betterstack.com/",
    sourceType: "official-marketing",
    dateVerified: "2026-07-17",
    reviewer: "content-editorial",
    confidence: "high",
    expirationReviewDate: "2026-10-17",
    public: true,
    usedByPages: ["fajita-vs-better-stack"],
  },
  {
    id: "statuspage-atlassian-product",
    competitor: "Atlassian Statuspage",
    productArea: "status-pages",
    fact: "Atlassian Statuspage is a dedicated status-page product with subscriber and incident communication features.",
    sourceUrl: "https://www.atlassian.com/software/statuspage",
    sourceType: "official-marketing",
    dateVerified: "2026-07-17",
    reviewer: "content-editorial",
    confidence: "high",
    expirationReviewDate: "2026-10-17",
    public: true,
    usedByPages: ["status-page-tools-small-teams", "fajita-vs-statuspage"],
  },

  {
    id: "pingdom-solarwinds-observability",
    competitor: "Pingdom",
    productArea: "monitoring",
    fact: "SolarWinds markets Pingdom as website monitoring that combines synthetic monitoring (uptime, page speed, transactions) with real user monitoring, and as part of a broader observability suite.",
    sourceUrl: "https://www.pingdom.com/",
    sourceType: "official-marketing",
    dateVerified: "2026-08-18",
    reviewer: "content-editorial",
    confidence: "high",
    expirationReviewDate: "2026-11-18",
    public: true,
    usedByPages: ["fajita-vs-pingdom"],
  },
  {
    id: "pingdom-30-day-trial",
    competitor: "Pingdom",
    productArea: "pricing",
    fact: "Pingdom's homepage advertises a 30-day free trial for website monitoring.",
    sourceUrl: "https://www.pingdom.com/",
    sourceType: "official-marketing",
    dateVerified: "2026-08-18",
    reviewer: "content-editorial",
    confidence: "high",
    expirationReviewDate: "2026-11-18",
    public: true,
    usedByPages: ["fajita-vs-pingdom"],
  },
  {
    id: "checkly-code-first-playwright",
    competitor: "Checkly",
    productArea: "monitoring",
    fact: "Checkly markets itself as a code-first active reliability layer: tests and monitors as JS/TS (Playwright), Terraform or Pulumi, plus status pages and an AI-native workflow.",
    sourceUrl: "https://www.checklyhq.com/",
    sourceType: "official-marketing",
    dateVerified: "2026-08-18",
    reviewer: "content-editorial",
    confidence: "high",
    expirationReviewDate: "2026-11-18",
    public: true,
    usedByPages: ["fajita-vs-checkly"],
  },
  {
    id: "checkly-start-for-free",
    competitor: "Checkly",
    productArea: "pricing",
    fact: "Checkly's homepage advertises a free start path (Start for free / no credit card required on the signup story).",
    sourceUrl: "https://www.checklyhq.com/",
    sourceType: "official-marketing",
    dateVerified: "2026-08-18",
    reviewer: "content-editorial",
    confidence: "high",
    expirationReviewDate: "2026-11-18",
    notes: "Confirm current free-tier limits on official pricing before quoting numbers.",
    public: true,
    usedByPages: ["fajita-vs-checkly"],
  },
].map((f) => competitorFactSchema.parse(f));

export const COMPETITOR_FACTS: CompetitorFact[] = rawFacts;

const BY_ID = new Map(COMPETITOR_FACTS.map((f) => [f.id, f]));

export function getFact(id: string): CompetitorFact | undefined {
  return BY_ID.get(id);
}

export function factsForPage(slug: string): CompetitorFact[] {
  return COMPETITOR_FACTS.filter((f) => f.usedByPages.includes(slug));
}

export function staleFacts(asOf = "2026-07-17"): CompetitorFact[] {
  return COMPETITOR_FACTS.filter((f) => f.expirationReviewDate < asOf);
}
