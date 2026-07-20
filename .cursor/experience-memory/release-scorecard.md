# Release scorecard

Production release evidence for Fajita. No category complete without evidence. Update via `release-quality-gates.mdc` and Phase G skills.

**Release version:** `[UNRESOLVED]`
**Release date:** `[UNRESOLVED]`
**Overall status:** Not ready for full production launch (Phase 18 Gate 6). Marketing site aligned for VC demo walkthrough (2026-07-17).

Canonical ops scorecard: `/internal/readiness` and `docs/readiness/final-production-readiness.md`. Do not treat visual scorecard Pass as launch approval while production-readiness classification is Not Ready.

**VC demo scope (marketing):** Homepage → features → pricing → docs/glossary → signup form. Copy, CTAs, FAQs, changelog, roadmap, integrations, and security page now match `accountsOpen=true` and published pricing. Full paid launch remains blocked by open criticals in `docs/readiness/launch-blocker-register.md` (legal counsel, restore exercise, Stripe live price verification, live payment test, production smoke).

---

## Scoring

Per item: Score 1–10 · Evidence link · Blocking (Y/N) · Owner · Status (Pending / Pass / Fail / Exception)

Critical journey categories below 9 require another pass unless external constraint documented.

---

## Visual quality

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| Art direction preserved | — | `approved-direction.md` | Y | — | Pending (not approved) |
| No template residue | — | `visual-qa-critic` | Y | — | Pending |
| Typography | — | Screenshots | Y | — | Pending |
| Responsive composition | 9 | `qa:screens` 45 routes, PH path 0 overflow | Y | — | Pass |
| Spacing defects | 9 | `layout-perfection-critic` PH pass 2026-07-20 | Y | — | Pass |
| Dark/light if supported | N/A | — | — | — | N/A |
| Images/icons | — | Manual | Y | — | Pending |
| No placeholder content | — | `content-realism-editor` | Y | — | Pending |

---

## Functional quality

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| Primary journeys E2E | — | `critical-user-journeys.md` | Y | — | Pending |
| Forms validation | — | Test notes | Y | — | Pending |
| Auth transitions | — | — | Y | — | Not implemented |
| Billing transitions | — | — | Y | — | Not implemented |
| No dead ends | — | Journey walk | Y | — | Pending |

---

## State completeness

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| Empty states | — | `interface-state-inventory.md` | Y | — | Pending |
| Loading states | — | Inventory | Y | — | Pending |
| Error states | — | Inventory | Y | — | Pending |
| Success states | — | Inventory | Y | — | Pending |
| Restricted/plan states | — | Inventory | N | — | Pending |
| Mobile + reduced motion | — | `cross-browser-qa-engineer` | Y | — | Pending |

---

## Onboarding

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| Clear completion | — | `onboarding-activation-architect` | Y | — | Not implemented |
| Activation measurable | — | `analytics-plan.md` | Y | — | Partial |
| Useful first screen | — | Screenshot | Y | — | Pending |

---

## Product clarity

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| 10-second comprehension | — | User test / review | Y | — | Pending |
| Value demonstrated quickly | — | Demo journey | Y | — | Pending |

---

## Trust

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| Claims registered | — | `trust-evidence-register.md` | Y | — | Partial |
| Pricing honest | — | Pricing page | Y | — | Not implemented |
| Company identity | — | `company.mdc` | Y | — | Verified |

---

## Performance

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| CWV mobile | — | Lighthouse | Y | — | Not measured |
| Performance budget | — | `performance-budget.md` | Y | — | Targets only |
| Async feedback | — | `perceived-performance-engineer` | Y | — | Pending |

---

## Accessibility

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| Focus/contrast/keyboard | — | Manual + axe | Y | — | Pending |
| Reduced motion | — | OS setting test | Y | — | Pending |

---

## Responsiveness

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| 360–1440px | — | Screenshots | Y | — | Pending |
| No horizontal overflow | — | `layout-perfection-critic` | Y | — | Pending |

---

## Browser coverage

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| Chrome | — | `cross-browser-qa-engineer` | Y | — | Pending |
| Safari | — | Same | Y | — | Pending |
| Firefox | — | Same | N | — | Pending |

---

## Analytics

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| Funnel events wired | — | `analytics-plan.md` | Y | — | Partial |
| No PII leakage | — | Network inspect | Y | — | Pending |

---

## Maintainability

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| `maintainability-critic` pass | — | Findings log | Y | — | Pending |
| Build/lint clean | — | CI | Y | — | Pending |

---

## Security-sensitive frontend

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| No secrets in client | — | Build grep | Y | — | Pending |
| Auth UI safe | — | Review | Y | — | Not implemented |

---

## Production readiness

| Item | Score | Evidence | Block | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| SEO + llms.txt | — | `seo-ai-visibility.mdc` | Y | — | Pending |
| Vertical slice passed | — | `DESIGN_WORKFLOW.md` | Y | — | Pending |
| Release gates all pass | — | This scorecard | Y | — | Fail |

---

## Critical journey experience scores (1–10)

| Journey | Comprehension | Value | Feedback | States | Recovery | Speed | Trust | A11y | Mobile | Polish | Realism | Conversion | Stability | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Discover | — | — | — | — | — | — | — | — | — | — | — | — | — | Pending |
| Sign up | — | — | — | — | — | — | — | — | — | — | — | — | — | Pending |
| Onboard | — | — | — | — | — | — | — | — | — | — | — | — | — | Pending |
| Core action | — | — | — | — | — | — | — | — | — | — | — | — | — | Pending |

**Rule:** Any critical category below 9 → another pass unless documented exception.

---

## Unicorn-quality checklist reference

See `DESIGN_WORKFLOW.md` § Mandatory Unicorn-Quality Product Details. Evaluate each item for relevance; do not blindly implement irrelevant features.

---

*Update after each release candidate review.*
