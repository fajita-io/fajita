# Public repository checklist

Launch gate before changing repository visibility or announcing OSS. All items must pass unless explicitly waived with documented reason.

## README and assets

- [ ] `README.md` finalized with positioning, quick start, verification explanation
- [ ] Hero and screenshot PNGs in `.github/assets/` reviewed for fictional data only
- [ ] Verification flow diagram accurate
- [ ] GitHub social preview image prepared (`.github/assets/github-social-preview.png`)
- [ ] README links validated (note post-public URLs)

## Legal and policy

- [ ] `LICENSE` is AGPL-3.0
- [ ] `TRADEMARKS.md` reviewed
- [ ] `SECURITY.md` reviewed (no internal infra leakage)
- [ ] `CODE_OF_CONDUCT.md` present
- [ ] Legal counsel sign-off complete ([LEGAL_REVIEW_CHECKLIST.md](./LEGAL_REVIEW_CHECKLIST.md))

## Contribution system

- [ ] `CONTRIBUTING.md` complete
- [ ] Issue templates (bug, feature, docs) present; no public security template
- [ ] Pull request template present
- [ ] Label taxonomy documented ([.github/LABELS.md](../../.github/LABELS.md))

## Documentation

- [ ] `docs/README.md` index complete
- [ ] Self-hosting docs public-ready (no phase/internal language)
- [ ] Architecture and monitoring docs published
- [ ] Cloud vs self-hosted doc published

## CI and security

- [ ] `oss-readiness.yml` passes on `main`
- [ ] Fork PRs cannot access production secrets (deploy workflow gated)
- [ ] gitleaks clean
- [ ] Secret scan clean (`npm run readiness:secrets`)
- [ ] Production secrets rotated ([SECRET_ROTATION_RUNBOOK.md](./SECRET_ROTATION_RUNBOOK.md))

## Self-host validation

- [ ] Clean install from README Quick Start succeeds
- [ ] `npm run selfhost:doctor` passes on fresh Compose stack
- [ ] `npm run pre-release:verify` passes

## GitHub metadata (apply at launch)

- [ ] Repository description set ([REPOSITORY_METADATA.md](./REPOSITORY_METADATA.md))
- [ ] Topics applied
- [ ] Homepage URL `https://fajita.io`
- [ ] Social preview uploaded in repository settings
- [ ] Secret scanning and push protection enabled
- [ ] Discussions enabled with categories ([DISCUSSIONS.md](./DISCUSSIONS.md))

## Release

- [ ] `CHANGELOG.md` updated for first tag
- [ ] Initial release notes drafted ([INITIAL_RELEASE_DRAFT.md](./INITIAL_RELEASE_DRAFT.md))
- [ ] Tag `v0.1.0` ready (do not push until public)

## History hygiene

- [ ] No customer data in screenshots or docs
- [ ] Internal planning artifacts not in public paths ([PUBLIC_EXPORT.md](./PUBLIC_EXPORT.md))
- [ ] `.cursor/mcp.json` and sensitive handoff docs excluded from export

## Sign-off

| Role | Status | Date |
| --- | --- | --- |
| Engineering | Automated gates + smoke test | 2026-08-26 | Yes |
| Legal | Counsel review | | Pending |
| Operator | Launch execution | 2026-08-26 | Yes |
