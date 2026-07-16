# Rejected patterns

Living record of what fajita-io will not do by default. Add entries when ideas fail QA or creative review. Conditions for reconsideration noted where relevant.

---

## Globally rejected AI-design patterns

| Pattern | Reason | Reconsider if |
| --- | --- | --- |
| Purple-to-blue gradients | Default AI aesthetic; no product meaning | Central metaphor explicitly requires spectral gradient with documented rationale |
| Random aurora backgrounds | Decoration without narrative | Animated sky is the brand metaphor and motion spec defines causality |
| Meaningless glowing orbs | Visual filler | Orbs represent real product concept (e.g., sources, nodes) with interaction |
| Excessive glassmorphism | Readability and slop risk | Material metaphor is glass/lens with accessibility-tested contrast |
| Floating dashboard-card collages | Generic SaaS hero | Cards show real live product data in composed editorial frame |
| Generic bento grids | Template signal | Bento encodes specific information architecture from product |
| Three-column feature-card sections | AI landing default | Narrative requires exactly three proofs with distinct art direction |
| Endless rounded rectangles | Sameness | Shape language documented with intentional variation |
| Identical border radii everywhere | Component-default look | Token spec defines purposeful radius roles |
| Random pills/badges above headlines | Startup chrome | Badge carries real status (beta, new proof type) |
| Generic abstract SVG blobs | Empty decoration | Blob is brand symbol with defined behavior |
| Fake terminal windows | False technical signaling | Terminal is the actual product interface |
| Decorative grids (fake technical) | Appearance without function | Grid is editorial or data structure from product |
| Centered text in every section | Monotonous hierarchy | Centering is rare, intentional beat |
| Giant neutral sans headlines | No typographic character | Type direction approves display face with rationale |
| Inter everywhere without rationale | Generic UI font default | Strategic justification in visual-decisions.md |
| Feature icon grids without narrative | Skimmable filler | Icons advance story per editorial-layout |
| Dark + neon accents (technical cosplay) | Category cliché | Dark mode is approved territory with full spec |
| Arbitrary gradient text | Slop | Gradient encodes brand color behavior |
| Excessive blur | Performance and clarity | Blur is material metaphor with limits |
| Generic testimonial carousels | Template trust | Real quotes in editorial composition |
| Fake logos / trust claims | Dishonest conversion | Real customers with permission |
| Product mockups floating in void | No context | Screenshots in composed scenes |
| Every section inside a card | Card-stack layout | Surface hierarchy uses space, not boxes |
| Decorative motion everywhere | No causality | Motion spec assigns purpose per element |
| Empty SaaS copy | See voice-and-boundaries.mdc | Never on customer surfaces |

## Master directive prohibitions (permanent, 2026-07-16)

From `fajita-master-directive.mdc` (0.0). Not reconsiderable.

| Pattern | Reason |
| --- | --- |
| Mexican restaurant aesthetics | Fajita is a monitoring company, not a food brand |
| Pepper mascots, sombreros, cartoon flames, plate-of-food imagery | Childish; kills technical credibility |
| Food-themed terminology in critical app workflows | Users must never decode a joke to operate monitoring |
| Novelty joke stretched across the product | Memorable without silly |
| Orange wash on every section | Heat gradients are strategic, not ambient |
| Motionless dashboard-screenshot piles | Directive requires modular interactive demonstrations |
| Long blocking animated intros | Signature animation must never delay comprehension or conversion |
| Framer structure/component/copy reproduction | Benchmark its quality category only |
| Scroll hijacking, constant floating, gratuitous parallax, cursor effects, text scrambling | Motion prohibitions in directive |
| Heavy animation libraries where lightweight techniques suffice | Performance standard |
| Generic icon packs or stock SaaS illustration as brand expression | Proprietary asset system required |
| Wordmark that is just a fashionable font | Custom identity system required |

## Category clichés

Product category confirmed: **uptime monitoring** (master directive 0.0). Full audit pending `creative-director`.

Likely candidates for monitoring products:
- Dark dashboard hero with neon green checkmarks
- World map with pulsing dots as the default hero
- Binary red/green status with no nuance
- Wall-of-integration-logos as primary proof
- Terminal cosplay to signal "for developers"

## Rejected creative directions

| Direction | Reason | Date |
| --- | --- | --- |
| *(none yet)* | Run `creative-director` to log rejected territories | — |

## Rejected typography approaches

| Approach | Reason |
| --- | --- |
| Inter / system-ui as silent default | No brand character |
| Single weight hierarchy | Flat hierarchy |
| All-caps body text | Readability |

## Rejected color approaches

| Approach | Reason |
| --- | --- |
| Purple-blue gradient heroes | AI slop |
| Neon accent on dark gray | Technical cosplay |

## Rejected layout approaches

| Approach | Reason |
| --- | --- |
| Headline → paragraph → button → three cards | Default SaaS stack |
| Centered everything | No editorial rhythm |
| Desktop stack-only mobile | Fails responsive art direction |

## Rejected motion approaches

| Approach | Reason |
| --- | --- |
| Fade-up on every section | No narrative purpose |
| Scroll hijacking on marketing | Friction and a11y |
| Cursor trails | Interaction interference |

## Rejected copy patterns

Align with `voice-and-boundaries.mdc` and `draper-honeycopy.mdc`:

- "AI-powered," "seamless," "unlock," "supercharge," "game-changing"
- "Built for modern teams," "all-in-one platform"
- "We believe that…," "In today's world…"
- Em dashes in customer-facing copy

## Direct reference imitation (rejected)

Do not reproduce layout, palette, typography combination, or signature compositions from:

- Linear, Stripe, Framer, Vercel, Apple, Notion, Arc

Extract logic via `reference-deconstruction` only.

---

*Add entries when `creative-director`, `reference-deconstruction`, or `visual-qa-critic` rejects ideas.*
