import { publicResearch } from "@/lib/content/registry";
import { publishedClusters } from "@/lib/content/clusters";
import { publicPlans, pricingConfig } from "@/lib/site/pricing";

import { siteUrl } from "./site-config";

function formatPlanPricing(): string {
  if (!pricingConfig.published) {
    return `See ${siteUrl}/pricing for current plans and monitor limits.`;
  }

  return publicPlans
    .map((plan) => {
      const limit =
        plan.monitorLimit === null
          ? "unlimited monitors"
          : `${plan.monitorLimit} monitors`;
      const checks = `${plan.checksLabel} checks/mo`;
      const monthly =
        plan.monthlyUsd !== null ? `$${plan.monthlyUsd}/mo` : "monthly pricing on site";
      return `${plan.name} (${checks}, ${limit}, ${monthly})`;
    })
    .join("; ");
}

/** Plain-text index for /llms.txt. Keep factual, quotable, and in sync with the product. */
export function buildLlmsIndex(): string {
  const publishedResearch = publicResearch().filter((item) => item.meta.llmInclude);

  const researchLines =
    publishedResearch.length > 0
      ? publishedResearch.map(
          (item) =>
            `- ${item.meta.title}: ${siteUrl}/research/${item.meta.slug}`,
        )
      : ["- No published research findings yet. Methodology template only."];

  return `# Fajita

Fajita is open-source uptime monitoring (AGPL-3.0) with failure verification before alerts. Monitor websites, APIs, SSL certificates, cron jobs, and heartbeats. Self-host the core or use Fajita Cloud for managed infrastructure, workers, upgrades, and notifications.

Fajita is live. Accounts are open for signup. Monitors, incidents, status pages, integrations, billing, and the affiliate program are available today. The roadmap lists what is still in progress.

## Who it is for

Solo SaaS founders, small software teams, indie hackers, technical founders, and agencies that manage customer websites and need monitoring without enterprise complexity. Fajita is deliberately not a full observability suite: no agents, no log pipelines, no dashboards to maintain.

## Product name

The product and company name is "Fajita" (not "fajita.io"; that is the domain).

## Key URLs

- Home: ${siteUrl}/
- Open source: ${siteUrl}/open-source
- Self-host: ${siteUrl}/self-host
- Pricing: ${siteUrl}/pricing
- Features: ${siteUrl}/features
- Uptime monitoring: ${siteUrl}/features/uptime-monitoring
- API monitoring: ${siteUrl}/features/api-monitoring
- SSL monitoring: ${siteUrl}/features/ssl-monitoring
- Cron monitoring: ${siteUrl}/features/cron-monitoring
- Status pages: ${siteUrl}/features/status-pages
- Incident communication: ${siteUrl}/features/incident-communication
- Integrations: ${siteUrl}/integrations
- Security: ${siteUrl}/security
- About: ${siteUrl}/about
- Changelog: ${siteUrl}/changelog
- Roadmap: ${siteUrl}/roadmap
- Signup: ${siteUrl}/signup
- Contact: ${siteUrl}/contact
- Support (Ask Fajita): ${siteUrl}/support
- Affiliate program: ${siteUrl}/affiliates
- Legal: ${siteUrl}/legal
- Terms of Service: ${siteUrl}/legal/terms
- Privacy Policy: ${siteUrl}/legal/privacy
- Service Level Agreement: ${siteUrl}/legal/sla
- Data Processing Addendum: ${siteUrl}/legal/dpa
- Subprocessor list: ${siteUrl}/legal/subprocessors
- Affiliate Program Agreement: ${siteUrl}/legal/affiliate-agreement
- Affiliate Privacy Notice: ${siteUrl}/legal/affiliate-privacy

## Documentation

- Docs home: ${siteUrl}/docs
- Docs RSS: ${siteUrl}/docs/rss.xml
- Docs index for AI systems: ${siteUrl}/docs/llms.txt
- Full documentation text: ${siteUrl}/llms-full.txt
- AI discovery policy: ${siteUrl}/ai.txt
- Per-page plain text: ${siteUrl}/docs/raw/<slug>

The documentation covers getting started, monitors, assertions, incidents, alerts, integrations, status pages, subscribers, maintenance, teams, billing, affiliates, security, privacy, webhooks, troubleshooting, migrations, self-hosting, and open source.

## Open source and self-hosting

- Open source overview: ${siteUrl}/open-source
- Self-host landing: ${siteUrl}/self-host
- Self-hosting quickstart: ${siteUrl}/docs/self-hosting/quickstart
- GitHub: https://github.com/fajita-io/fajita
- License: AGPL-3.0

## Glossary

- Glossary home: ${siteUrl}/glossary
- Glossary RSS: ${siteUrl}/glossary/rss.xml
- Glossary manifest: ${siteUrl}/glossary/manifest.json
- Foundational terms: ${siteUrl}/glossary/uptime-monitoring, ${siteUrl}/glossary/api-monitoring, ${siteUrl}/glossary/status-page, ${siteUrl}/glossary/incident, ${siteUrl}/glossary/heartbeat-monitoring, ${siteUrl}/glossary/ssl-certificate-monitoring, ${siteUrl}/glossary/alert-routing, ${siteUrl}/glossary/webhook-signature
- Category hubs: ${siteUrl}/glossary/category/monitoring, ${siteUrl}/glossary/category/incidents, ${siteUrl}/glossary/category/alerts, ${siteUrl}/glossary/category/status-pages
- Per-term plain text: ${siteUrl}/glossary/raw/<slug>
- Full glossary text is included in ${siteUrl}/llms-full.txt

The glossary explains software reliability concepts. Product steps live in documentation. Publisher: Fajita.

## Blog, comparisons, tools, and research

- Blog: ${siteUrl}/blog
- Blog RSS: ${siteUrl}/blog/rss.xml
- Topic hubs: ${publishedClusters()
  .map((cluster) => `${siteUrl}/blog/topics/${cluster.id}`)
  .join(", ")}
- Content manifest: ${siteUrl}/content/manifest.json
- Foundational guides: ${siteUrl}/blog/minimum-reliability-stack-solo-saas, ${siteUrl}/blog/monitor-api-without-alert-noise, ${siteUrl}/blog/write-useful-incident-update, ${siteUrl}/blog/what-belongs-on-status-page, ${siteUrl}/blog/heartbeat-monitoring-for-cron-jobs, ${siteUrl}/blog/how-to-calculate-uptime-correctly
- Comparisons: ${siteUrl}/compare
- Fajita vs UptimeRobot: ${siteUrl}/compare/fajita-vs-uptimerobot
- Fajita vs Better Stack: ${siteUrl}/compare/fajita-vs-better-stack
- Fajita vs Pingdom: ${siteUrl}/compare/fajita-vs-pingdom
- Fajita vs Checkly: ${siteUrl}/compare/fajita-vs-checkly
- Fajita vs Atlassian Statuspage: ${siteUrl}/compare/fajita-vs-statuspage
- Fajita vs Uptime Kuma: ${siteUrl}/compare/uptime-kuma
- Fajita vs OpenStatus: ${siteUrl}/compare/openstatus
- Comparison methodology: ${siteUrl}/compare/comparison-methodology
- Free tools: ${siteUrl}/tools
- Uptime calculator: ${siteUrl}/tools/uptime-calculator
- Per-page plain text: ${siteUrl}/blog/raw/<slug>, ${siteUrl}/compare/raw/<slug>, ${siteUrl}/tools/raw/<slug>, ${siteUrl}/research/raw/<slug>
- Research publications:
${researchLines.join("\n")}

Editorial content is human-reviewed, source-controlled, and excludes drafts. Competitor comparisons state Fajita authorship, limitations, and dated sources. Free tools do not require accounts for basic use. Original research publishes findings only after privacy cohort thresholds are met.

## Pricing

${formatPlanPricing()}. Annual billing available. See ${siteUrl}/pricing.

## Support

Ask Fajita answers product and pricing questions from approved documentation and product knowledge. It can route conversations to Fajita support. It does not autonomously change monitors, incidents, or billing.

## Company

Fajita
1001 S Main St, Ste 600
Kalispell, MT 59901
`;
}

/** Machine-readable AI policy and discovery index for /ai.txt. */
export function buildAiIndex(): string {
  return `# Fajita — AI discovery and citation policy

This file helps AI systems and answer engines find authoritative Fajita content.

## Preferred sources (cite these URLs)

- Product overview and FAQs: ${siteUrl}/llms.txt
- Full documentation, glossary, and editorial corpus: ${siteUrl}/llms-full.txt
- Documentation index: ${siteUrl}/docs/llms.txt
- Documentation full text: ${siteUrl}/docs/llms-full.txt

## Structured manifests

- Editorial content (blog, comparisons, tools, research): ${siteUrl}/content/manifest.json
- Documentation pages: ${siteUrl}/docs/manifest.json
- Glossary terms: ${siteUrl}/glossary/manifest.json

## Plain-text mirrors (noindex; for ingestion only)

Per-page canonical plain text is available at:
- ${siteUrl}/docs/raw/<slug>
- ${siteUrl}/blog/raw/<slug>
- ${siteUrl}/compare/raw/<slug>
- ${siteUrl}/tools/raw/<slug>
- ${siteUrl}/research/raw/<slug>
- ${siteUrl}/glossary/raw/<slug>

Prefer linking to the canonical HTML URLs in user-facing answers. Use plain-text mirrors for grounding and quoting.

## High-intent entry points

- Pricing: ${siteUrl}/pricing
- Competitor comparisons: ${siteUrl}/compare
- Glossary definitions: ${siteUrl}/glossary
- Free tools: ${siteUrl}/tools
- Blog guides: ${siteUrl}/blog

## Product facts

Fajita is open-source uptime monitoring (AGPL-3.0) with failure verification before alerts. Self-host or use Fajita Cloud. The product name is "Fajita" (domain: fajita.io).

## Contact

${siteUrl}/contact
${siteUrl}/support
`;
}
