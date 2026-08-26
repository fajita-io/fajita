# Phase 3 GitHub readiness report

Date: 2026-08-26

## Executive Summary

Phase 3 productizes the Fajita repository for eventual public release. The root README, documentation hierarchy, contribution system, GitHub templates, release documentation, branded screenshot assets, and CI hardening are in place.

Phase 2 reported **READY FOR PUBLIC RELEASE (engineering)**. Phase 3 builds on that without making the repository public, publishing a release, or announcing OSS.

**Status: READY FOR PHASE 4** with operator blockers (legal sign-off, secret rotation, manual clean-install QA with Clerk) documented below.

## Repository Positioning

**Core:** Open-source uptime monitoring that verifies failures before waking you up.

**Supporting:** Monitor websites, APIs, SSL certificates, and cron jobs. Fajita verifies trouble before it alerts you.

Three ideas communicated in README and metadata:

1. Fajita is open source (AGPL-3.0, self-hostable, contributable)
2. Fajita is differentiated (verification before escalation)
3. Fajita Cloud exists (managed option, not second-class OSS)

## README Status

| Item | Status |
| --- | --- |
| Logo / wordmark via brand screenshot | Done |
| Positioning and links | Done |
| Useful badges (license, CI, Docker, security) | Done (CI badge active after public) |
| Hero screenshot | Done |
| Why Fajita / verification | Done |
| Feature surface (actual capabilities) | Done |
| Quick start | Done |
| Architecture summary | Done |
| Self-host vs Cloud table | Done |
| Screenshot grid | Done |
| Contributing, security, roadmap, license, trademark | Done |
| Cloud CTA (non-annoying) | Done |
| Star CTA | Done |

## Screenshot Assets

Location: `.github/assets/`

| Asset | Purpose |
| --- | --- |
| `fajita-dashboard.png` | Monitor list hero |
| `fajita-monitor-detail.png` | Latency and checks |
| `fajita-incident-verification.png` | Verification timeline |
| `fajita-status-page.png` | Public status page |
| `fajita-verification-flow.png` | How it works diagram |
| `github-social-preview.png` | GitHub social preview |

All use fictional `acme-platform.example` data. Source SVGs included; regenerate PNGs with `npm run repo:assets`.

**Not created:** 15–30s demo GIF/video (optional Phase 3 item; deferred to reduce scope without blocking launch prep).

## GitHub Metadata

Prepared in [REPOSITORY_METADATA.md](./REPOSITORY_METADATA.md):

- Description text
- Topics list
- Homepage `https://fajita.io`
- Social preview asset path
- No FUNDING.yml (Cloud is commercial path)

Apply manually when repository visibility changes.

## Documentation

| Document | Status |
| --- | --- |
| [docs/README.md](../README.md) | Created |
| [docs/architecture/OVERVIEW.md](../architecture/OVERVIEW.md) | Created |
| [docs/architecture/MONITORING.md](../architecture/MONITORING.md) | Created |
| [docs/SELF_HOSTED_VS_CLOUD.md](../SELF_HOSTED_VS_CLOUD.md) | Created |
| [docs/contributing/DEVELOPMENT.md](../contributing/DEVELOPMENT.md) | Created |
| [docs/contributing/DESIGN.md](../contributing/DESIGN.md) | Created |
| [docs/releases/VERSIONING.md](../releases/VERSIONING.md) | Created |
| [docs/releases/RELEASING.md](../releases/RELEASING.md) | Created |
| [docs/self-hosting/PRIVACY.md](../self-hosting/PRIVACY.md) | Created |
| [docs/self-hosting/SECURITY.md](../self-hosting/SECURITY.md) | Created |
| Self-hosting docs (Phase 2) | Updated (QUICKSTART fix, troubleshooting expansion) |
| [examples/](../../examples/) | docker-compose, caddy, nginx |

## Self-Hosting Docs

Public-ready. Internal phase language removed from new public docs. Phase 2 reports remain under `docs/open-source/` with internal subfolder for launch-only drafts.

## Contribution System

| Item | Status |
| --- | --- |
| [CONTRIBUTING.md](../../CONTRIBUTING.md) | Expanded |
| [CODE_OF_CONDUCT.md](../../CODE_OF_CONDUCT.md) | Present (Contributor Covenant 2.1) |
| Issue templates (bug, feature, docs) | Created |
| PR template | Created |
| Security routing in issue config | Done (no public security template) |
| [GOOD_FIRST_ISSUES.md](./internal/GOOD_FIRST_ISSUES.md) | Internal list |
| [DISCUSSIONS.md](./DISCUSSIONS.md) | Structure defined |

## Security

| Item | Status |
| --- | --- |
| [SECURITY.md](../../SECURITY.md) | Finalized (Phase 1/2 baseline) |
| Self-host [SECURITY.md](../self-hosting/SECURITY.md) | Created |
| Deploy workflow fork guard | Added (`github.repository == 'fajita-io/fajita'`) |
| Workflow `permissions: contents: read` | Added to CI and OSS readiness |
| Log sanitization guidance | Issue templates + troubleshooting |

## License

| Item | Status |
| --- | --- |
| [LICENSE](../../LICENSE) | AGPL-3.0 |
| `package.json` license field | `AGPL-3.0-or-later` |
| License scan in `oss:check` | Pass |

No CITATION.cff (not required for this project type).

## Trademark

[TRADEMARKS.md](../../TRADEMARKS.md) present and aligned with README.

## CI

| Workflow | Purpose |
| --- | --- |
| `oss-readiness.yml` | gitleaks, oss check, db bootstrap, Go tests, compose smoke |
| `ci.yml` | typecheck, tests, audit |
| `release.yml` | tag-triggered GHCR publish |
| `deploy.yml` | Vercel (canonical repo only) |

[dependabot.yml](../../.github/dependabot.yml) added with conservative cadence.

## Public Fork Security

Reviewed:

- `pull_request` triggers use read-only permissions; no production secrets in OSS/CI workflows
- `deploy.yml` gated to canonical repository and push-only
- No `pull_request_target` workflows
- gitleaks on full history in OSS readiness

## Issue Templates

- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/ISSUE_TEMPLATE/documentation.yml`
- `.github/ISSUE_TEMPLATE/config.yml` (security contact link, blank issues disabled)

## Release System

| Item | Status |
| --- | --- |
| [CHANGELOG.md](../../CHANGELOG.md) | Created (Unreleased + 0.1.0 draft) |
| [VERSIONING.md](../releases/VERSIONING.md) | Semver, pre-1.0 policy |
| [RELEASING.md](../releases/RELEASING.md) | Maintainer process |
| [RELEASE_NOTES_TEMPLATE.md](../releases/RELEASE_NOTES_TEMPLATE.md) | Template |
| [INITIAL_RELEASE_DRAFT.md](./internal/INITIAL_RELEASE_DRAFT.md) | Internal draft (not published) |

## Roadmap

[ROADMAP.md](../../ROADMAP.md) created (Now / Next / Later, no timelines).

## Final Secret Scan

```text
npm run readiness:secrets → Secret scan OK across 1954 tracked files.
```

gitleaks runs in CI on push/PR to main.

## Final License Scan

`npm run oss:check:fast` license_file check: **OK**

## Clean Install Verification

| Check | Result |
| --- | --- |
| `docker compose config -q` | Pass |
| `npm run oss:selfhost-check:fast` | Pass |
| `npm run oss:check:fast` | Pass (555 tests) |
| Full README path with Clerk + running stack | **Not run in this session** (requires operator Clerk app and manual QA per Phase 2) |

Quick Start commands match [QUICKSTART.md](../self-hosting/QUICKSTART.md). Operator must configure Clerk and secrets; docs state this explicitly.

## Known Limitations

1. Clerk still required for authentication (no native self-hosted auth).
2. CI badge and GitHub release links inactive until repository is public under `fajita-io/fajita`.
3. Demo GIF/video asset not produced.
4. Phase 1 report file not present on disk at Phase 3 start (Phase 2 report used as gate).
5. Automated authenticated full-stack e2e in CI remains optional hardening.
6. Some internal docs under `docs/open-source/` remain in tree for private prep; review [PUBLIC_EXPORT.md](./PUBLIC_EXPORT.md) before export.

## Remaining Public Launch Blockers

1. Legal counsel sign-off ([LEGAL_REVIEW_CHECKLIST.md](./LEGAL_REVIEW_CHECKLIST.md))
2. Production secret rotation ([SECRET_ROTATION_RUNBOOK.md](./SECRET_ROTATION_RUNBOOK.md))
3. Manual clean-install following README only (with real Clerk test app)
4. Apply [PUBLIC_REPO_CHECKLIST.md](./PUBLIC_REPO_CHECKLIST.md) and [REPOSITORY_METADATA.md](./REPOSITORY_METADATA.md) at visibility flip
5. Publish `v0.1.0` tag and GHCR images when approved
6. Do not announce until Phase 4

## Recommended Phase 4 Work

- Public repository visibility and metadata application
- OSS announcement and fajita.io OSS landing alignment (without breaking existing SEO)
- Publish `v0.1.0` release and container images
- Enable Discussions with defined categories
- Create GitHub issues from GOOD_FIRST_ISSUES list
- Optional demo GIF for README
- Marketing comparison page links when those routes exist

---

### READY FOR PHASE 4

Engineering and repository productization are complete. Phase 4 may begin for launch/distribution once operator blockers (legal, secrets, manual clean-install sign-off) are cleared. Do not make the repository public until the public repo checklist is signed off.
