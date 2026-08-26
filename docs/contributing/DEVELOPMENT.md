# Development guide

Setup for contributing to Fajita. Self-hosters who only want to run the product should start with [QUICKSTART.md](../self-hosting/QUICKSTART.md).

## Prerequisites

- Node.js 22+
- npm 10+
- Go 1.23+ (monitor worker changes)
- Docker and Docker Compose (self-host path)
- PostgreSQL access (local Supabase or Compose)

## Local setup (Cloud-style dev)

```bash
git clone https://github.com/fajita-io/fajita.git
cd fajita
npm ci
cp .env.example .env.local
# Configure Clerk + Supabase local or remote dev project
npm run dev
```

Run tests:

```bash
npm run typecheck
npm run lint
npm test
npm run oss:check:fast
```

## Self-hosted dev stack

```bash
cp .env.example .env
# FAJITA_DEPLOYMENT_MODE=self_hosted + Clerk keys
npm run selfhost:up
npm run selfhost:doctor
```

Monitor worker (separate terminal):

```bash
cd services/monitor-worker
go run ./cmd/worker
```

Alert worker:

```bash
npx tsx scripts/alert-worker.ts
```

## Database

```bash
npm run db:migrate    # apply pending SQL migrations
npm run db:status     # show migration ledger
```

Migrations live in `supabase/migrations/`. Never apply ad-hoc DDL outside migration files.

## Common commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run oss:selfhost-check:fast` | Self-host validation without Docker build |
| `npm run readiness:secrets` | Secret scan |
| `npm run selfhost:doctor` | Validate self-host configuration |

## Go worker tests

```bash
cd services/monitor-worker
go test ./...
```

## Pull request checks

CI runs on pull requests to `main`:

- Typecheck, unit tests, dependency audit
- OSS readiness: gitleaks, migration bootstrap, Go tests, Compose smoke

Fork PRs do not receive production deployment secrets.

## Related docs

- [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [Design contributions](./DESIGN.md)
- [Architecture overview](../architecture/OVERVIEW.md)
