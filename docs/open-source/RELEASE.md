# Public release checklist

Complete every item before making the repository public and announcing open source.

## Automated gates (must pass)

```bash
npm run pre-release:verify    # all checks below in one command
npm run oss:check             # includes build
npm run oss:selfhost-check    # docker build + compose
```

Individual commands:

| Command | Validates |
| --- | --- |
| `npm run readiness:secrets` | No credentials in tracked files |
| `npm run typecheck` | TypeScript |
| `npm test` | 553+ unit tests |
| `npm audit` | Zero high/critical vulnerabilities |
| CI `oss-readiness.yml` | gitleaks, db bootstrap, Go tests, Compose smoke |

## Operator tasks

### 1. Rotate secrets

```bash
npm run secrets:rotate -- --generate   # new worker/cron tokens
# Rotate provider keys in dashboards per SECRET_ROTATION_RUNBOOK.md
npm run secrets:rotate -- --verify --strict   # with production env loaded
```

### 2. Legal review

Complete [LEGAL_REVIEW_CHECKLIST.md](./LEGAL_REVIEW_CHECKLIST.md) with counsel sign-off.

### 3. Public export

Follow [PUBLIC_EXPORT.md](./PUBLIC_EXPORT.md). Exclude `.cursor/mcp.json`, handoff docs with production refs.

### 4. Publish repository

1. Create public GitHub repository (or change visibility)
2. Push `main` branch
3. Enable GitHub secret scanning and push protection
4. Create release tag `v0.1.0` to publish Docker images (see `.github/workflows/release.yml`)

### 5. Verify self-host path

```bash
cp .env.example .env
# configure self_hosted mode + Clerk
npm run selfhost:up
npm run selfhost:doctor
curl http://localhost:3000/api/health
curl http://localhost:8080/readyz
```

### 6. Announce (when ready)

Use draft in [ANNOUNCEMENT_DRAFT.md](./ANNOUNCEMENT_DRAFT.md). Update fajita.io when appropriate.

## Post-release

- [ ] Submit sitemap (unchanged for fajita.io)
- [ ] Monitor GitHub issues and security reports
- [ ] Tag patch releases for security fixes

## Status

When all automated gates pass and operator tasks are complete:

**READY FOR PUBLIC RELEASE**

### Completed (2026-08-26)

- [x] `npm run pre-release:verify`
- [x] Docker Compose smoke (db + rest + migrate + full stack health)
- [x] `npm run selfhost:doctor` — Fajita ready
- [x] App-controlled Vercel secret rotation + production redeploy
- [x] Production health check: `https://fajita.io/api/health`

### Remaining before flip

- [ ] Provider secret rotation (Clerk, Stripe, Supabase, Resend) in dashboards
- [ ] Legal counsel sign-off
- [x] Commit + push OSS release branch to GitHub (2026-08-26)
- [x] Make repository public — https://github.com/Accomplish-Labs/fajita-io
- [x] Enable secret scanning + push protection
- [x] Tag `v0.1.0` pushed (GHCR publish via `.github/workflows/release.yml`)
