# Creative thesis

Source of truth: `fajita-master-directive.mdc` (0.0). Update via `creative-director` and `conversion-experience-designer`. Do not invent facts; mark unknowns `[UNRESOLVED]`.

---

## Product

**Name:** Fajita (customer-facing company name; repository slug: fajita-io)

**Description:** Uptime-monitoring software. Fajita monitors websites, APIs, certificates, and cron jobs, alerts teams before customers report the problem, and includes public status pages.

**Core product surfaces (per master directive):** Monitors, Incidents, Status Pages, Alert Channels, Maintenance, Team, Billing, Settings.

**Superseded hypothesis:** Earlier repository signals suggested a citation/provenance product. The master directive (2026-07-16) establishes monitoring as the product. Citation-era analytics goals were replaced with monitoring goals (`first_monitor`, `monitor_created`, `alert_channel_added`, `status_page_published`) in `src/lib/analytics/goals.ts` on the same date.

## Audience

Software teams responsible for keeping services up: developers, SREs, ops-minded founders. `[UNRESOLVED]` primary persona detail (team size, sophistication) pending positioning work.

## Business goal

`[UNRESOLVED]` Revenue model and pricing. Stripe checkout scaffolding exists; subscription SaaS is the working assumption.

## Desired action

Start using Fajita (signup / start monitoring). Homepage must carry one dominant CTA plus one secondary exploration action.

## Emotional objective

The visitor should feel they are looking at the person in the room who notices the smoke before anyone else smells it: sharp, observant, calm during emergencies. First five seconds: "this company is technically credible and watching closely."

## Central idea

**Fajita watches software before it gets too hot.** The brand world interprets heat, pressure, timing, smoke, ignition, cooling, and controlled energy through a sophisticated technology lens. The metaphor stays intelligent and restrained: a premium monitoring company with an unforgettable creative platform, never a restaurant brand or a food joke stretched into a product.

## Strategic tension

Playful name, deadly serious job. The brand resolves the tension between memorability (heat, sizzle, mischief) and operational trust (calm, precise, always watching). Also: creative ambition vs. immediate comprehension; the homepage must be visually ambitious and still explain uptime monitoring within the first viewport.

## Brand personality

Sharp. Confident. Observant. Fast. Slightly mischievous. Technically competent. Calm during emergencies. Memorable without becoming silly. Premium without becoming sterile. Creative without sacrificing clarity.

## Category conventions

`[UNRESOLVED]` Full audit pending `creative-director`. Competitive set for audit: uptime/monitoring products (e.g. status page and monitoring category incumbents). Expected defaults to audit: dark dashboards with neon green checks, world-map heroes, red/green binary status, wall-of-integrations logos, terminal cosplay.

## Conventions to retain

- Conventional product labels in the app: Monitors, Incidents, Status Pages, Alert Channels, Maintenance, Team, Billing, Settings
- Clear status semantics: healthy, degraded, down, maintenance, paused, unknown
- Clear CTAs, standard forms, accessible focus, legible type
- Public status pages that read instantly under stress

## Conventions to reject

- Static dashboard screenshot piles (use modular interactive demonstrations)
- Generic SaaS landing template, prebuilt Tailwind dashboard look
- Cartoon flames, pepper mascots, sombreros, plate-of-food literalism
- Washing every section in orange; arbitrary orange-red gradients
- Framer imitation (benchmark its quality category, never its design)
- See `rejected-patterns.md` and `anti-ai-slop.mdc`

## Brand promise

Your team hears about problems before your customers do. Practically: monitoring, verified detection, alerting, incident communication, recovery visibility. Emotionally: calm command of systems under heat.

## Creative opportunity

No monitoring competitor owns a coherent thermal world: heat as the visual language of system state (cool = healthy, thermal expansion = latency, restrained smoke = degradation, precise flare = outage, cooling = recovery). Fajita can own it because the name demands it; a competitor copying it would look derivative of Fajita.

## One-sentence creative thesis

Fajita should feel like the calm, sharp engineer who notices the smoke first, because the product's entire job is seeing software heat up before customers feel the burn.

## Approved copy territory (homepage hero)

- Headline territory: **Know when your software gets too hot.**
- Supporting copy: "Fajita monitors your websites, APIs, certificates, and cron jobs. When something starts cooking, your team hears about it before your customers do."

## Success criteria

The direction succeeds when:

- [ ] First viewport communicates: uptime monitoring; websites/APIs/certificates/cron jobs; alerts before customers notice; public status pages; clear CTA
- [ ] Logo-hidden test passes on marketing and app shell
- [ ] AI-Slop Test passes on homepage and primary app view
- [ ] Visitor could say "as polished as Framer," never "a Framer clone"
- [ ] Signature moment is ownable (thermal system narrative) and memorable
- [ ] Mobile is recomposed, not stacked desktop
- [ ] `visual-qa-critic` scores ≥ 9 on critical routes
- [ ] Nothing reads as a restaurant brand or food joke

## Open questions

1. ~~Customer-facing product name~~ **Fajita** (see `company.mdc`)
2. ~~Product category~~ **Uptime monitoring** (master directive 0.0)
3. Primary persona detail and team size sweet spot
4. Pricing model and plan structure
5. Competitive set finalization for category audit
6. Identity territory selection (heat waveform, monitored burner, F from status lines, etc.) via `creative-director`

---

*Last updated: 2026-07-16, master creative directive 0.0 adopted. Run `creative-director` to develop territories and the identity system.*
