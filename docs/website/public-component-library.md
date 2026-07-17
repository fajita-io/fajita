# Public component library (Phase 2)

Public-site components live in `src/components/site/`; shared primitives
from Phase 1 live in `src/components/design-system/` and
`src/components/brand/`. Styles: `src/styles/site.css` (`fj-*` classes on
Phase 1 tokens only; no new color or spacing values).

## Shell

| Component | File | Notes |
| --- | --- | --- |
| `SiteHeader` | `site-header.tsx` | Client. Sticky, scroll state, Features + Company dropdowns, composed mobile panel, Escape/click-outside close, body scroll lock |
| `SiteFooter` | `site-footer.tsx` | Server. Footer moment, CTA, link columns, address, theme toggle. Pamphlet mount point documented, not rendered |
| `FooterMoment` | `footer-moment.tsx` | Client. Reduced Thermal Stack incident loop, user-initiated |
| `FooterCta` / `CtaButtons` | | CTA pairs wired to DataFast goals |

## Product demonstration

| Component | File | Notes |
| --- | --- | --- |
| `HeroNarrative` | `home/hero-narrative.tsx` | Eight-beat hero story |
| `ProductJourney` | `home/product-journey.tsx` | Nine-step demo (see interactive-demo.md) |
| `CoverageExplorer` | `home/coverage-explorer.tsx` | ARIA tabs over five monitor types |
| `MonitorPreview` | `monitor-preview.tsx` | Server-rendered monitor card, deterministic data |
| `StatusPagePreview` | `status-page-preview.tsx` | Five simulated status-page scenarios |
| `AlertFlow` | `alert-flow.tsx` | Server-renderable SVG, CSS animation |
| `FeatureDemo` | `feature-demo.tsx` | Maps feature slug to demonstration |

## Content and conversion

| Component | File | Notes |
| --- | --- | --- |
| `PlanCards` | `plan-cards.tsx` | Reads `src/lib/site/pricing.ts` only |
| `FaqList` | `faq-list.tsx` | Native details/summary, `faq_expanded` goal |
| `ContactForm` | `contact-form.tsx` | Validation, honeypot, success/failure states |
| `EarlyAccessForm` | `early-access-form.tsx` | One-field capture, honeypot |

## Deliberately not built yet

Announcement bar, testimonial block, logo strip, pricing toggle
(no published prices to toggle), accessible modal (nothing needs one),
breadcrumbs component (feature pages render inline breadcrumbs +
JSON-LD). Build them when a second real use exists.

## Integration mount points

- **Pamphlet chat**: mounts after the footer base row. Design notes: it
  must not cover the footer CTA on mobile, must respect the theme
  tokens, and displays "Powered by Pamphlet" per its own program rules.
  Nothing renders until the chatbot phase ships.
- **Accomplish attribution**: no approval found in project docs; add to
  the footer base row only when documented, smaller than the Fajita
  brand block.
