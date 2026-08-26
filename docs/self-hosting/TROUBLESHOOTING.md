# Self-hosted troubleshooting

## Doctor first

```bash
npm run selfhost:doctor
```

## Common issues

### Web starts but app errors on every action

- Confirm `NEXT_PUBLIC_SUPABASE_URL` points to PostgREST (Compose: `http://localhost:54321`).
- Confirm anon and service role JWTs match `SUPABASE_JWT_SECRET`.
- Run `npm run db:status` to verify migrations applied.

### Monitors never run

- Check worker: `curl http://localhost:8080/readyz`
- Confirm `CRON_SECRET` is set and scheduler container is running.
- Manual tick: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/monitor-tick`
- Verify monitor is not paused and organization has active entitlements (self-hosted: always active).

### Clerk sign-in works but app shows no org

- Configure Clerk webhook to your deployment URL.
- Check webhook signing secret matches `CLERK_WEBHOOK_SIGNING_SECRET`.

### Email alerts fail

- Run doctor email check.
- Configure SMTP or Resend.
- Alert UI shows "not configured" until a provider is set (expected when email disabled).

### Heartbeat monitors always down

- Confirm heartbeat URL uses your `NEXT_PUBLIC_APP_URL`, not `fajita.io`.
- Ensure worker or cron runs `detect_missed_heartbeats`.

### Status pages wrong host

- Set `NEXT_PUBLIC_STATUS_PAGE_DOMAIN` for your zone.
- Path-based pages work at `/status/<slug>` without DNS.

### Private service monitoring

Default SSRF protections block private IPs. To monitor internal services:

```text
FAJITA_ALLOW_PRIVATE_NETWORKS=true
```

Review [CONFIGURATION.md](./CONFIGURATION.md) security notes first.

## Logs

```bash
npm run selfhost:logs
docker compose logs monitor-worker
docker compose logs web
```

## Ops health

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/health/ops
```

## Reverse proxy

See [CONFIGURATION.md](./CONFIGURATION.md) for `NEXT_PUBLIC_APP_URL` behind Caddy, Nginx, or Traefik. Set forwarded headers and HTTPS at the proxy; point the proxy to web `:3000`.

Examples: [examples/caddy/README.md](../../examples/caddy/README.md), [examples/nginx/README.md](../../examples/nginx/README.md)

```text
monitor.example.com {
  reverse_proxy localhost:3000
}
```

Ensure WebSocket upgrades pass through if using realtime features.

## Migrations pending

Symptoms: API errors referencing missing columns or functions.

```bash
npm run db:status
docker compose run --rm migrate
```

## Worker not processing checks

- `curl http://localhost:8080/readyz` should succeed
- Inspect `docker compose logs monitor-worker`
- Confirm `DATABASE_URL` reachable from worker container
- Manual tick: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/monitor-tick`

## Scheduler not running

- Confirm `scheduler` service is up in Compose
- Verify `CRON_SECRET` matches between env and scheduler container
- Check `docker compose logs scheduler`

## Public URL incorrect

- `NEXT_PUBLIC_APP_URL` must match the browser origin (including HTTPS)
- Heartbeat URLs and status page links derive from this value

## Webhook failing

- Confirm signing secret configured in alert channel
- Check alert worker logs for delivery errors
- Verify outbound HTTPS is allowed from worker/network

## SSL check issues

- Target must present a valid certificate chain from the worker's network
- Expiry monitors use TLS inspection distinct from HTTP uptime checks

## Status page inaccessible

- Path pages: `/status/<slug>` on web port
- Subdomain pages require DNS and `NEXT_PUBLIC_STATUS_PAGE_DOMAIN`

## Sanitized logging

When attaching logs to issues, remove:

- `Authorization` headers and cookies
- API keys, webhook secrets, `CRON_SECRET`
- `MONITOR_SECRET_KEYRING` and database passwords
- Monitor authentication headers stored in config
