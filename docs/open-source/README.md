# Open source documentation

Artifacts for Fajita's open-source launch under AGPL-3.0.

## Public operator and contributor docs

| Document | Purpose |
| --- | --- |
| [../README.md](../README.md) | Documentation index |
| [../self-hosting/README.md](../self-hosting/README.md) | Self-hosting hub |
| [../architecture/OVERVIEW.md](../architecture/OVERVIEW.md) | Public architecture |
| [../SELF_HOSTED_VS_CLOUD.md](../SELF_HOSTED_VS_CLOUD.md) | Deployment comparison |
| [PUBLIC_REPO_CHECKLIST.md](./PUBLIC_REPO_CHECKLIST.md) | Launch gate |
| [REPOSITORY_METADATA.md](./REPOSITORY_METADATA.md) | GitHub description, topics, social preview |
| [DISCUSSIONS.md](./DISCUSSIONS.md) | Discussions categories |

## Internal / pre-release only

Do not surface these paths in public README CTAs. Safe to keep in private repo until export scrub.

| Document | Purpose |
| --- | --- |
| [internal/GOOD_FIRST_ISSUES.md](./internal/GOOD_FIRST_ISSUES.md) | Launch issue candidates |
| [internal/INITIAL_RELEASE_DRAFT.md](./internal/INITIAL_RELEASE_DRAFT.md) | Draft v0.1.0 release notes |
| [PHASE_2_SELF_HOSTING_REPORT.md](./PHASE_2_SELF_HOSTING_REPORT.md) | Phase 2 engineering report |
| [PHASE_3_GITHUB_READINESS_REPORT.md](./PHASE_3_GITHUB_READINESS_REPORT.md) | Phase 3 GitHub productization report |
| [SECRET_ROTATION_RUNBOOK.md](./SECRET_ROTATION_RUNBOOK.md) | Pre-publish rotation |
| [PUBLIC_EXPORT.md](./PUBLIC_EXPORT.md) | Export exclusion list |
| [LEGAL_REVIEW_CHECKLIST.md](./LEGAL_REVIEW_CHECKLIST.md) | Counsel checklist |
| [RELEASE.md](./RELEASE.md) | Operator release checklist |

## Root policy files

- [../../LICENSE](../../LICENSE)
- [../../CONTRIBUTING.md](../../CONTRIBUTING.md)
- [../../SECURITY.md](../../SECURITY.md)
- [../../TRADEMARKS.md](../../TRADEMARKS.md)
- [../../CODE_OF_CONDUCT.md](../../CODE_OF_CONDUCT.md)

## Automated gates

```bash
npm run oss:check:fast
npm run oss:selfhost-check:fast
npm run pre-release:verify
npm run readiness:secrets
```

CI: `.github/workflows/oss-readiness.yml`  
Release: `.github/workflows/release.yml`
