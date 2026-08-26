# Phase 4 public site report

Date: 2026-08-26

## Executive Summary

Phase 4 updates fajita.io to communicate the open-source + Fajita Cloud model while preserving existing design, SEO routes, and Cloud conversion paths. New marketing pages `/open-source` and `/self-host`, homepage OSS sections, navigation/footer updates (gated by launch flag), pricing repositioning as Fajita Cloud, self-hosting and open-source documentation, comparison pages, analytics events, and launch drafts are implemented.

The repository remains private. OSS marketing is **noindex and nav-hidden** until `NEXT_PUBLIC_OSS_LAUNCHED=true`.

**Status: READY FOR PHASE 5** with operator blockers unchanged from Phase 3 (legal sign-off, secret rotation, manual clean-install QA, repository visibility flip).

---

## Homepage Changes

- Hero eyebrow: "Open source uptime monitoring"
- Headline: "Catch outages before your customers do."
- Lede mentions verification + self-host / Cloud choice
- Primary CTA: "Start with Fajita Cloud"
- Secondary CTA: GitHub when launched; "See how it works" pre-launch
- Tertiary link: "Self-host Fajita" when launched
- New **Open by default** section (`OpenSourceHomeSection`)
- **DeploymentChoice** comparison grid before final CTA
- Final CTA band: "Know when it is actually down."
- Home FAQ adds open-source question
- Metadata updated for OSS positioning

## Navigation Changes

- Desktop: Product, Pricing, **Open Source** (when launched), Docs, Blog
- Mobile: `SiteHeaderMobileNav` drawer with matching links
- Primary header CTA: "Start with Fajita Cloud"

## Open Source Page

Route: `/open-source`

- Hero, why open source, capabilities list, verification comparison, architecture flow, quick start, deployment choice, project links, FAQ, JSON-LD (FAQPage + SoftwareApplication)
- `noindex` until launch flag enabled

## Self-Host Page

Route: `/self-host`

- Requirements, architecture summary, quick start, operator responsibilities, security notes, deployment choice, Cloud escape hatch
- JSON-LD WebApplication
- `noindex` until launch flag enabled

## Pricing Changes

- Hero reframed as **Fajita Cloud**
- OSS callout with "Self-host instead" CTA
- Billing FAQ extended with OSS / Cloud questions
- Plans unchanged (Core, Team, Scale)

## Docs Changes

New categories and pages:

**Self-hosting:** quickstart, configuration, authentication, backups, upgrades, troubleshooting, security

**Open source:** architecture, contributing, roadmap, changelog, license

- `DocsGithubLink` on doc pages (when launched)
- Canonical public docs remain at `fajita.io/docs`

## SEO Changes

- `/open-source` and `/self-host` in sitemap when `NEXT_PUBLIC_OSS_LAUNCHED=true`
- Pre-launch: OSS pages use `noindex`
- `llms.txt` updated with OSS URLs, GitHub, license
- New comparisons: `/compare/uptime-kuma`, `/compare/openstatus`
- Existing comparisons note self-hosting option
- Existing routes preserved

## Schema

- `/open-source`: FAQPage, SoftwareApplication
- `/self-host`: WebApplication
- Homepage SoftwareApplication description updated

## Internal Linking

- Homepage → open source section, deployment choice, self-host, Cloud
- Pricing → self-host callout
- About → open-by-design principle, self-host CTA
- Security → open-source security section
- Comparisons → self-host links
- Footer → OSS column when launched
- Docs → self-hosting and open-source nav sections

## Analytics

New DataFast goals:

- `open_source_viewed`
- `github_clicked`
- `self_host_clicked`
- `cloud_from_oss_clicked`
- `docs_self_host_clicked`

Wired on hero, OSS pages, deployment choice, footer, pricing callout.

## OSS → Cloud Funnel

Path documented and instrumented:

```text
Organic / GitHub → /open-source → self-host docs → Fajita Cloud signup
```

Cloud CTAs remain primary on homepage and pricing. No aggressive upsell modals on self-host docs.

## GitHub Integration

- Central config: `src/lib/site/oss-config.ts`
- Repo URL: `https://github.com/fajita-io/fajita`
- GitHub buttons hidden until launch (private repo dead-end prevention)
- Star count integration: **deferred** (no fake counts; build hook ready for Phase 5)
- Release badge: `OSS_INITIAL_VERSION = 0.1.0` in config, not displayed on marketing until release publishes

## Feature Flag

```text
NEXT_PUBLIC_OSS_LAUNCHED=false   # default
```

When false:

- OSS pages noindex
- OSS routes omitted from sitemap
- Open Source nav/footer hidden
- GitHub CTAs hidden

When true (launch day): flip in production per `LAUNCH_SWITCH_CHECKLIST.md`.

## Launch Assets Prepared

| Asset | Location |
| --- | --- |
| Launch switch checklist | `docs/open-source/LAUNCH_SWITCH_CHECKLIST.md` |
| Product Hunt decision | `docs/open-source/PRODUCT_HUNT_RELAUNCH.md` |
| Directory metadata | `docs/open-source/DIRECTORY_METADATA.md` |
| Blog draft | `docs/open-source/internal/LAUNCH_BLOG_DRAFT.md` |
| HN draft | `docs/open-source/internal/HACKER_NEWS_DRAFT.md` |
| Reddit drafts | `docs/open-source/internal/REDDIT_DRAFTS.md` |
| Social drafts | `docs/open-source/internal/SOCIAL_DRAFTS.md` |
| Announcement page draft | `docs/open-source/internal/ANNOUNCEMENT_PAGE_DRAFT.md` |

Nothing published. Repository not public.

## Legal Review Items

- [ ] Counsel review: Cloud Terms vs AGPL for self-hosted operators
- [ ] Privacy policy scope for self-hosted (operator responsibility documented in docs)
- [ ] Trademark guidance linked from OSS page (TRADEMARKS.md)
- [ ] Confirm affiliate and Cloud legal pages need no OSS-specific amendment

## Cloud Regression

| Area | Status |
| --- | --- |
| Homepage Cloud CTAs | Pass (primary remains Cloud signup) |
| Pricing plans | Pass (unchanged) |
| Signup href | Pass (`/signup`) |
| Nav login + Cloud CTA | Pass |
| Feature routes | Pass (untouched) |
| App routes | Pass (untouched) |

Full live checkout regression not run in this session (requires Stripe test mode).

## SEO Regression

| Check | Status |
| --- | --- |
| Existing routes preserved | Pass |
| Sitemap conditional OSS routes | Pass |
| Pre-launch noindex on OSS pages | Pass |
| llms.txt updated | Pass |
| Canonical metadata via buildMetadata | Pass |
| Comparison index expanded | Pass |

## Accessibility

- Mobile nav: keyboard Escape closes drawer, aria-expanded on toggle
- Deployment choice: semantic lists and headings
- Code blocks: horizontal scroll via `pre.fj-code`
- Focus states preserved on existing button primitives

Full screen-reader audit not run in this session.

## Performance

- No third-party GitHub widgets or star embeds
- No new client bundles on static OSS page content beyond existing header mobile nav
- Architecture/verification sections are CSS + text (no heavy images)

CWV not re-measured in this session.

## Remaining Launch Blockers

1. Legal counsel sign-off
2. Production secret rotation
3. Manual README-only clean install with Clerk
4. Set repository public (`fajita-io/fajita`)
5. Publish `v0.1.0` release and container images
6. Flip `NEXT_PUBLIC_OSS_LAUNCHED=true` in production
7. Verify GitHub links live after visibility change

## Recommended Phase 5 Work

- Execute `LAUNCH_SWITCH_CHECKLIST.md`
- Publish launch blog and distribution posts
- Enable GitHub Discussions
- Optional: GitHub star count with cached API + graceful fallback
- Optional: OG images for `/open-source` and `/self-host`
- Monitor OSS analytics funnel week one
- Create good-first issues from internal list

---

### READY FOR PHASE 5

Public site OSS transition is implemented and gated. Phase 5 may begin launch execution once operator blockers are cleared. Do not make the repository public or flip the launch flag until the checklist is signed off.
