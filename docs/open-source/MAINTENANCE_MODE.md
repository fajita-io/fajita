# Low-maintenance operating mode

Internal policy for Fajita after the OSS launch. Public wording: "Stable, community-friendly, and maintained." Do not describe the project as abandoned.

## Purpose

Fajita should compound as an asset (GitHub, SEO, Cloud, TrustMRR) without competing for proactive founder product-development time unless documented reactivation thresholds are met.

## What Fajita receives

| Category | Scope |
| --- | --- |
| Security | Patches, dependency alerts, responsible disclosure response |
| Reliability | Severe bugs affecting Cloud or self-host core paths |
| Dependencies | Grouped Dependabot PRs; no blind major upgrades |
| Contributors | Issue triage, PR review when quality is acceptable |
| Cloud customers | Support for paying managed service |
| Releases | When security fixes, contributor merges, or accumulated fixes warrant a tag |
| Documentation | Corrections for broken install paths or inaccurate claims |

## What Fajita does not receive

- Proactive feature development
- Redesigns or new monitor types without traction signal
- New billing tiers or enterprise features without demand
- Mass content production or SEO campaigns
- Discord or parallel community infrastructure
- Chasing acquisition buyers

## Founder-time rule

> Fajita gets zero proactive founder product-development hours unless it crosses a documented reactivation threshold.

### Exceptions (always act)

- Security incident or active exploit
- Cloud paying customer blocked on core workflow
- Serious infrastructure failure affecting Cloud
- Credible acquisition inquiry with substantive diligence

## Support model

### Self-hosted

- Documentation at `fajita.io/docs/self-hosting`
- GitHub Issues for reproducible bugs
- GitHub Discussions for questions and ideas
- No guarantee of hands-on debugging for arbitrary operator environments

### Fajita Cloud

- Managed service support per product terms
- Billing and entitlement issues prioritized for paying customers

## Issue priority

| Priority | Examples | Action |
| --- | --- | --- |
| P0 | Security, data loss, severe production failure | Fix immediately |
| P1 | Self-host install completely broken; Cloud critical regression | Fix urgently |
| P2 | Major reproducible core monitoring bug | Usually fix |
| P3 | Feature request, polish, niche deployment | Backlog or community |
| P4 | Preference, speculative feature | Decline or defer |

## Release cadence

Release when there is:

- A security fix
- Important dependency update (security-related)
- Contributor contribution worth shipping
- Accumulated Cloud or core bug fixes

No artificial monthly cadence.

## Quality gates (every release)

```bash
npm run pre-release:verify
npm run oss:check
```

Tag only from passing `main`. Do not bypass CI for maintenance releases.

## Automation

- Dependabot: grouped updates; manual review for majors
- GitHub secret scanning and push protection: enabled on public repo
- `oss-readiness.yml`: required on `main`
- `release.yml`: publishes GHCR images on version tags

## Maintainer boundaries

- Do not grant write/admin to strangers without trust history
- Security reports stay private until patched
- External PRs must meet design, security, test, and docs standards
- No merging bad work for contributor excitement

## Telemetry

Self-hosted instances must not gain new Fajita tracking because OSS launched. Preserve the privacy stance in self-hosting docs.

## TrustMRR

Keep listing live. Update when OSS metrics become meaningful (see reactivation thresholds). Do not lower price automatically because source is public.

## Related

- [REACTIVATION_THRESHOLDS.md](./REACTIVATION_THRESHOLDS.md)
- [30_DAY_REVIEW.md](./30_DAY_REVIEW.md)
- [90_DAY_DECISION_FRAMEWORK.md](./90_DAY_DECISION_FRAMEWORK.md)
- [LAUNCH_SWITCH_CHECKLIST.md](./LAUNCH_SWITCH_CHECKLIST.md)
