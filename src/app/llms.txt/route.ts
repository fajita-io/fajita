const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fajita.io";

const body = `# Fajita

Fajita is uptime-monitoring software for founders, developers, agencies, and small software teams. It watches websites, APIs, SSL certificates, cron jobs, and heartbeat endpoints, verifies a failure before alerting anyone, and notifies teams through email, Slack, Discord, and webhooks. Public status pages let teams communicate incidents clearly and show real uptime history to customers.

Fajita accounts are open for signup. The public site documents what is live, what is in public beta, and what remains planned. Nothing claims to be live before it is.

## Who it is for

Solo SaaS founders, small software teams, indie hackers, technical founders, and agencies that manage customer websites and need monitoring without enterprise complexity. Fajita is deliberately not a full observability suite: no agents, no log pipelines, no dashboards to maintain.

## Product name

The product and company name is "Fajita" (not "fajita.io"; that is the domain).

## Key URLs

- Home: ${siteUrl}/
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
- Affiliate Program Agreement: ${siteUrl}/legal/affiliate-agreement
- Affiliate Privacy Notice: ${siteUrl}/legal/affiliate-privacy

## Documentation

- Docs home: ${siteUrl}/docs
- Docs index for AI systems: ${siteUrl}/docs/llms.txt
- Full documentation text: ${siteUrl}/llms-full.txt
- Per-page plain text: ${siteUrl}/docs/raw/<slug>

The documentation covers getting started, monitors, assertions, incidents, alerts, integrations, status pages, subscribers, maintenance, teams, billing, affiliates, security, privacy, webhooks, troubleshooting, and migrations.

## Glossary

- Glossary home: ${siteUrl}/glossary
- Glossary manifest: ${siteUrl}/glossary/manifest.json
- Foundational terms: ${siteUrl}/glossary/uptime-monitoring, ${siteUrl}/glossary/api-monitoring, ${siteUrl}/glossary/status-page, ${siteUrl}/glossary/incident, ${siteUrl}/glossary/heartbeat-monitoring, ${siteUrl}/glossary/ssl-certificate-monitoring, ${siteUrl}/glossary/alert-routing, ${siteUrl}/glossary/webhook-signature
- Category hubs: ${siteUrl}/glossary/category/monitoring, ${siteUrl}/glossary/category/incidents, ${siteUrl}/glossary/category/alerts, ${siteUrl}/glossary/category/status-pages
- Per-term plain text: ${siteUrl}/glossary/raw/<slug>
- Full glossary text is included in ${siteUrl}/llms-full.txt

The glossary explains software reliability concepts. Product steps live in documentation. Attribution: Powered by Wiki (https://wiki.co). Publisher: Fajita.

## Blog, comparisons, tools, and research

- Blog: ${siteUrl}/blog
- Blog RSS: ${siteUrl}/blog/rss.xml
- Content manifest: ${siteUrl}/content/manifest.json
- Foundational guides: ${siteUrl}/blog/minimum-reliability-stack-solo-saas, ${siteUrl}/blog/monitor-api-without-alert-noise, ${siteUrl}/blog/write-useful-incident-update, ${siteUrl}/blog/what-belongs-on-status-page, ${siteUrl}/blog/heartbeat-monitoring-for-cron-jobs, ${siteUrl}/blog/how-to-calculate-uptime-correctly
- Comparisons: ${siteUrl}/compare
- Comparison methodology: ${siteUrl}/compare/comparison-methodology
- Free tools: ${siteUrl}/tools
- Uptime calculator: ${siteUrl}/tools/uptime-calculator
- Research: ${siteUrl}/research
- Research methodology template: ${siteUrl}/research/methodology-template
- Per-page plain text: ${siteUrl}/blog/raw/<slug>, ${siteUrl}/compare/raw/<slug>, ${siteUrl}/tools/raw/<slug>

Editorial content is human-reviewed, source-controlled, and excludes drafts. Competitor comparisons state Fajita authorship, limitations, and dated sources. Free tools do not require accounts for basic use. Original research publishes findings only after privacy cohort thresholds are met.

## Pricing

Three plans: Starter (10 monitors, $9/mo), Pro (50 monitors, $19/mo), Business (unlimited monitors, $39/mo), with annual options. See ${siteUrl}/pricing.

## Support

Ask Fajita answers product and pricing questions from approved documentation and product knowledge. It can route conversations to Fajita support. It does not autonomously change monitors, incidents, or billing.

## Company

Fajita
1001 S Main St, Ste 600
Kalispell, MT 59901
`;

export function GET() {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
