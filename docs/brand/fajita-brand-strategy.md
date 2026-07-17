# Fajita brand strategy

Version 1.0 · Phase 1 · Internal document. Nothing in this file is customer-facing copy.

Fajita is uptime-monitoring software. It watches websites, APIs, SSL certificates, and cron jobs, detects failures quickly, alerts the team, and communicates incidents through polished public status pages.

The brand promise:

**Know when your software gets too hot.**

---

## Audience

### Primary

| Segment | What they need | What they fear |
| --- | --- | --- |
| Solo SaaS founders | One tool that watches everything they shipped | Waking up to a night of missed revenue |
| Small software teams (2 to 15 engineers) | Fast setup, clear alerts, no ops team required | Being told about the outage by a customer |
| Indie hackers | Cheap, credible monitoring for many small projects | Silent cron failures and expired certificates |
| Technical founders | Proof of reliability they can show customers | Looking amateur during an incident |
| Agencies managing client sites | One place to watch every client property | The client noticing downtime first |
| Product teams without enterprise tooling | Monitoring without a Datadog contract | Complexity that nobody maintains |

### Secondary

Developers, DevOps generalists, support teams, small ecommerce operators, digital agencies, affiliates who promote developer tools, and potential acquirers evaluating the product and its brand as transferable assets.

### The person we write for

A technical person who ships software and answers for it. They do not need monitoring explained to them. They need a reason to believe this one is faster to set up, calmer to operate, and better looking in front of their customers.

## Core customer problem

Today, this person discovers outages from the worst possible sources:

- An angry customer email
- A support ticket queue that suddenly fills
- A social post they did not see for an hour
- A checkout that quietly stopped converting
- An SSL certificate that expired on a Saturday
- A cron job that has silently failed for nine days
- Internal panic, in that order

Every one of these means the customer felt the problem before the team did. Fajita reverses the order. The team gets the earlier, clearer signal.

## Positioning statement

> For founders and small software teams who answer for their own uptime, Fajita is uptime-monitoring software that catches trouble while it is still warming up, unlike enterprise observability suites and bare-bones ping checkers, because it watches websites, APIs, certificates, and cron jobs together, verifies before it alerts, and publishes status pages customers actually trust.

Category: uptime monitoring (with status pages). Not observability, not APM, not log management. We say "uptime monitoring" in every directory listing and category description.

## Emotional benefit

Fajita sells a feeling before it sells a feature: **you already know.**

- Confidence: the stack is watched even while you sleep
- Control: heat is visible before it becomes fire
- Early warning: minutes of head start instead of an inbox of complaints
- Calm: incidents become procedure, not panic
- Professionalism: a status page that looks like a serious company wrote it
- Customer trust: proof of reliability, published in public

## Functional benefit

Fajita helps users detect problems, verify incidents before alarming anyone, alert the right channels, publish updates, prove uptime with history, and protect customer confidence during the worst hour of the quarter.

## Brand tension

The brand lives on a set of deliberate contrasts. Every design and copy decision should hold both sides at once:

| One side | Other side | Resolution |
| --- | --- | --- |
| Serious infrastructure | Memorable personality | The heat metaphor carries personality; the product interface stays operational |
| Technical precision | Creative warmth | Warm palette and editorial type over precise data and honest numbers |
| Emergency awareness | Operational calm | Alerts are urgent; the brand voice never is |
| Controlled heat | Uncontrolled failure | Fajita's world is always controlled: signal, boundary, recovery |
| Premium design | Lightweight simplicity | Seven-figure craft applied to a tool you set up in minutes |

The name is playful. The job is deadly serious. The brand wins by resolving that tension, not by hiding from it.

## Brand archetype

**Primary: The Guardian.** Fajita watches so the customer does not have to. The Guardian supplies trust, vigilance, and protection. It is the reason the interface is calm, the status colors are honest, and the alerts are verified before they wake anyone up.

**Secondary: The Jester, used with restraint.** The name, the heat metaphor, and occasional dry wit make Fajita memorable in a category of gray dashboards. The Jester appears in marketing headlines, empty states, and launch moments. The Jester never appears in incident copy, alert emails, status pages during outages, or anywhere a customer is having a bad day.

Ratio in practice: roughly 90 percent Guardian, 10 percent Jester, and 0 percent Jester during an incident.

## The one-line character brief

Fajita is the calm operator who notices the first trace of smoke before anyone else knows something is wrong. Sharp, fast, observant, slightly mischievous when things are fine, and completely steady when they are not.

## What Fajita must never look like

Recorded permanently in `.cursor/design-memory/rejected-patterns.md` and `fajita-master-directive.mdc`:

- A Mexican restaurant or food-delivery brand
- A cartoon food mascot
- A cheap developer-tool template or generic Tailwind SaaS
- A Framer clone
- An orange-gradient startup
- A monitoring dashboard with food jokes pasted on

## Competitive frame (audit, not imitation)

Category defaults Fajita rejects: dark dashboards with neon green checks, world-map heroes with pulsing dots, binary red/green status with no nuance, integration-logo walls as primary proof, and terminal cosplay. Category conventions Fajita keeps for usability: conventional product labels (Monitors, Incidents, Status Pages, Alert Channels, Maintenance, Team, Billing, Settings), clear status semantics, and status pages that read instantly under stress.

No competitor owns a coherent thermal visual world. Fajita can own it because the name demands it; a competitor copying it would look derivative of Fajita.

## Creative references and provenance

Significant references consulted during Phase 1, and how the result differs:

| Reference | What was extracted | What was not taken |
| --- | --- | --- |
| Framer.com | Quality bar only: spatial confidence, typography discipline, motion restraint | No layout, component, palette, type pairing, copy, or interaction was reproduced |
| Thermal imaging and heat-map conventions | The idea that temperature is a legible gradient from calm to critical | No literal FLIR rainbow palettes; Fajita uses a controlled two-hue heat ramp |
| Analog gauges and burner controls | Controlled heat as a dial, not an explosion | No skeuomorphic knobs or kitchen hardware |
| Seismograph and EKG traces | A continuous line that tells the truth about a system | No medical styling; the Fajita line is geometric and monolinear |

All logo artwork, icons, illustrations, and the Thermal Stack are original vector work created in this repository. No Gatus code, interface, or assets were referenced or reproduced. No stock marks, premade flame logos, or generator output were used.

## Success criteria for the brand

- A visitor can describe Fajita's look from memory ("the warm cream one with the heat line")
- The logo-hidden test passes: pages are recognizably Fajita with the mark covered
- The word "restaurant" never comes up in user testing
- The status page is calmer than the marketing site, and both are unmistakably the same company
- An acquirer could operate the identity from the documentation in `/docs/brand/` alone
