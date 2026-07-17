# Trust evidence register

Every customer-facing claim must have evidence. Update via `trust-experience-designer`. Status: Verified · Example · Unverified · Retired

---

## Company identity

| Claim | Location | Evidence | Verification | Accuracy | Owner | Review | Risk if wrong | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Company name is Fajita | Footer, legal, llms.txt | `company.mdc` | Internal rule | Current | — | 2026-07-16 | Legal/trust | Verified |
| Address: 1001 S Main St, Ste 600, Kalispell, MT 59901 | Contact, legal | `company.mdc` | Internal rule | Current | — | 2026-07-16 | Legal notice validity | Verified |

---

## Product claims

| Claim | Location | Evidence | Verification | Accuracy | Owner | Review | Risk if wrong | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Fajita monitors websites, APIs, certificates, and cron jobs | Homepage hero, features pages | `src/lib/site/claims.ts` (at-launch); site framed as early access, `accountsOpen: false` | Claims registry + `tests/site-content.test.ts` | Future-facing until engine ships | — | 2026-07-16 | Misleading marketing | Example (early-access framing); verify at launch |
| Alerts reach teams before customers report problems | Hero support copy, alert-flow section | `claims.ts`; channels limited to email, Slack, Discord, webhook | Claims registry + tests | Future-facing | — | 2026-07-16 | Misleading marketing | Example; verify at launch |
| Public status pages included | Homepage, `/features/status-pages` | `claims.ts` | Claims registry + tests | Future-facing | — | 2026-07-16 | Misleading marketing | Example; verify at launch |
| Verification from a second location before alerting | Detection section, feature pages | `claims.ts` (registered at-launch) | Claims registry | **Must be confirmed against shipped engine before launch** | — | 2026-07-16 | Overclaiming | Unverified; flagged in phase-2 handoff |
| No fake numbers, logos, testimonials, or uptime stats anywhere | Site-wide | Content tests scan all typed sources | `tests/site-content.test.ts` | Current | — | 2026-07-16 | Trust damage | Verified |

---

## Technical / security claims

| Claim | Location | Evidence | Verification | Accuracy | Owner | Review | Risk if wrong | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| *(none published yet)* | — | — | — | — | — | — | — | — |

**Do not publish** SOC 2, enterprise-grade, or security badges until verified and registered here.

---

## Social proof

| Claim | Location | Evidence | Verification | Accuracy | Owner | Review | Risk if wrong | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| *(none yet)* | — | — | — | — | — | — | — | — |

---

## Demo vs. live

| Claim | Location | Evidence | Verification | Accuracy | Owner | Review | Risk if wrong | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Interactive demo output | Homepage product journey, coverage explorer, monitor preview, status-page previews | Deterministic local fixture data; copy states it is a demonstration; no network calls; no claim a real monitor was created | Component code + `tests/site-demo.test.tsx` (asserts zero fetches) | Example labeled | — | 2026-07-16 | False capability | Verified |
| `/status` reflects reality | `/status` | Page states live status monitoring is not yet published; no hardcoded "operational" claim, no fake history | Page copy review | Current | — | 2026-07-16 | Fake health data | Verified |

---

## Affiliate program (Phase 12)

| Claim | Location | Evidence | Verification | Accuracy | Owner | Review | Risk if wrong | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Affiliate program exists and pays commissions | May appear on `/affiliates` and related surfaces | `programPublished=true`; feature stage `public_beta`; claims `affiliate-program` = available-now; Agreement + Privacy in force | Claims registry + legal hub + counsel review memo | Live public beta | `/affiliates`, `/legal/affiliate-agreement` | 2026-07-17 | Premature marketing | Verified published |
| Specific commission rate / threshold / recurring months | May state as current Program Terms (not guarantees) | Version 1 in `config.ts` + Schedule A; claim `affiliate-commission-rate` = available-now | Claims registry + Agreement | Version 1 live | Schedule A | 2026-07-17 | False commercial terms | Verified aligned |
| Guaranteed affiliate income | Nowhere | Claim `affiliate-income-guarantee` = internal-only PROHIBITED | Claims registry | N/A | — | 2026-07-17 | Deceptive marketing | Verified banned |
| Agreement / privacy notice in force | `/legal` lists in-preparation only | Drafts in `docs/legal/*-draft.md`; no public href | Legal hub | Draft | — | 2026-07-17 | Binding unreviewed terms | Verified draft-only |

---

*Add a row before any new marketing, security, pricing, or performance claim ships.*
