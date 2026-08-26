# Self-hosting quickstart

Target: open `http://localhost:3000`, sign in, create a monitor, and see checks run locally.

## Prerequisites

- Docker and Docker Compose
- A [Clerk](https://clerk.com) application (your own, not Fajita's)
- Node.js 22+ (for local scripts outside Docker)

## Steps

### 1. Clone and configure

```bash
git clone https://github.com/Accomplish-Labs/fajita-io.git
cd fajita-io
cp .env.example .env
```

Edit `.env`:

```text
FAJITA_DEPLOYMENT_MODE=self_hosted
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321

# Clerk (your application)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase-compatible JWT keys (local PostgREST defaults)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6jE5ODM4MTI5OTZ9.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YbrN1IY

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
CRON_SECRET=<long-random-string>
MONITOR_SECRET_KEYRING=1:<base64-of-32-bytes>
```

Generate encryption key:

```bash
node -e "console.log('1:' + require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Configure Clerk

In your Clerk dashboard:

- Add `http://localhost:3000` to allowed origins
- Set sign-in redirect to `/app`
- Configure the Supabase third-party auth integration (see [AUTHENTICATION.md](./AUTHENTICATION.md))
- Point the Clerk webhook to `https://your-host/api/webhooks/clerk` (use a tunnel for local dev)

### 3. Start the stack

```bash
npm run selfhost:up
```

Services started:

| Service | Port | Role |
| --- | --- | --- |
| web | 3000 | Next.js application |
| rest | 54321 | PostgREST (Supabase-compatible API) |
| db | 5432 | PostgreSQL |
| monitor-worker | 8080 | Check scheduler and executor |
| scheduler | (internal) | Cron sidecar for alert/maintenance ticks |

The web container uses `SUPABASE_URL=http://rest:3000` internally while your browser still talks to `http://localhost:54321`. Docker Compose sets this automatically; no manual edit needed for the default stack.

### 4. Verify

```bash
npm run selfhost:doctor
curl http://localhost:3000/api/health
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/health/ops
curl http://localhost:8080/readyz
```

### 5. Use the product

1. Open `http://localhost:3000`
2. Sign up through Clerk
3. Create an organization (first user becomes admin)
4. Add a monitor targeting a public HTTPS URL
5. Wait for the worker lease cycle (default poll ~1s, interval per monitor)
6. Confirm check results in the monitor detail view

## Local development without Docker

```bash
supabase start          # local Supabase stack (alternative to Compose db+rest)
npm run db:migrate         # if using plain Postgres
npm run dev                # Next.js
# In separate terminals:
cd services/monitor-worker && go run ./cmd/worker
npx tsx scripts/alert-worker.ts
```

Trigger cron manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/monitor-tick
```

## Email (optional)

Self-hosted installs boot without email. Configure either:

- **SMTP**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` (and credentials if needed)
- **Resend**: your own `RESEND_API_KEY`

Alert email channels report a clear configuration error until one provider is set.
