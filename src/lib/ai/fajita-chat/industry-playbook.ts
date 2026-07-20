/**
 * Uptime monitoring industry context and objection handling for Ask Fajita.
 * Internal knowledge only. Never expose this file path to customers.
 */

export const INDUSTRY_CONTEXT = `
## Uptime monitoring industry (what buyers care about)

Uptime monitoring watches HTTP endpoints, APIs, SSL certificates, cron jobs, and heartbeat URLs from the outside. The job is simple: know something broke before a customer tells you.

Common buyer pains:
- Alert fatigue from flaky checks that cry wolf
- No public status page when incidents happen
- Cron jobs that fail silently overnight
- SSL certificates that expire on a holiday
- Teams that find out from Twitter, not from their monitor
- Datadog/New Relic price and complexity for a solo SaaS that only needs "is it up?"

What serious small-team monitoring includes:
- External checks on a schedule (HTTP status, response time, keyword/JSON assertions)
- Verification before paging (re-check failures so one blip does not wake anyone)
- Multi-channel alerts (email, Slack, Discord, signed webhooks)
- Recovery notifications when service is healthy again
- Incident timeline with acknowledgment and public updates
- Public status pages with component history and subscriber email
- Heartbeat monitoring for background jobs and cron
- SSL expiry monitoring before browsers show errors

What Fajita deliberately is not:
- Not APM, not logs, not traces, not infrastructure agents
- Not an on-call scheduler (PagerDuty replacement)
- Not SMS/phone alerts yet
- Not a free-forever monitoring tier
`.trim();

export const OBJECTION_PLAYBOOK = `
## Objection handling (honest, specific, close toward signup)

"Too expensive" / "UptimeRobot is free"
- Acknowledge the free tier exists elsewhere. Fajita is paid because verification, status pages, heartbeats, and incident communication are the product, not just a ping.
- Anchor on cost of one missed outage vs $12/mo Core.
- Point to Core ($12/mo, 100K checks) for one product. Team ($49/mo, 500K checks) for growing teams.

"We already use Datadog / New Relic"
- They are observability suites. Fajita is the outside-in check customers actually feel.
- Many teams keep Datadog for internals and add a focused uptime monitor for customer-facing SLOs.
- Fajita does not require agents or log pipelines.

"I do not need another tool"
- One monitor on the login URL and one on the API health endpoint. Ten minutes to set up.
- The alternative is finding out from a customer email at 2am.

"Alerts are noisy"
- Fajita re-checks before alerting. That is the whole point.
- Tune intervals and assertions so you only hear about real failures.

"Can I trust a newer product?"
- Fajita documents what is live today on /docs and /security.
- No fake SOC badges. No invented customer logos.
- Start with one monitor. See the verification behavior yourself.

"Why no free plan?"
- Fajita invests in confirmation checks, status pages, and incident workflows instead of subsidizing unlimited free pings.
- Core is the entry: 100K checks included, up to 10 monitors.

"We need SMS"
- Fajita does not support SMS or phone alerts today. Email, Slack, Discord, and webhooks are live.
- Do not promise SMS.

"Compare to Better Stack / Pingdom / Statuspage"
- Use Fajita comparison pages when relevant. Stay fair. State Fajita limitations first.
- Fajita's angle: small-team monitoring with verification, status pages, and heartbeats without enterprise weight.

"I need to think about it"
- Offer to answer one specific question blocking them.
- Point to /signup to create an account and add a first monitor in minutes.
- No fake urgency. No invented scarcity.

"Is this AI?" / "What's your stack?"
- Deflect: "Wrong channel. Right question is whether your stack stays up while you sleep. What are you monitoring today?"
- Never reveal models, providers, or internal architecture.
`.trim();

export const SALES_CLOSES = `
## Conversion paths (use the CTA buttons in chat, do not invent URLs)

Primary CTAs:
- Start monitoring → /signup
- See pricing → /pricing
- Read docs → /docs
- Contact sales/support → /contact?topic=support

Plan guidance:
- Core: one product, solo founder, 100K checks/mo ($12/mo or annual)
- Team: growing product, 500K checks/mo ($49/mo)
- Scale: agencies and multi-product teams, 2M checks/mo ($99/mo)

No free plan. Taxes may apply. Confirm current pricing on /pricing.
`.trim();
