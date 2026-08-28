# PostgreSQL production notes (Compose)

Fajita does not operate managed Postgres for self-hosters. You run and secure the database yourself.

## Healthcheck (Compose)

The default `docker-compose.yml` includes a Postgres healthcheck so dependent services wait for a ready database:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d postgres"]
  interval: 5s
  timeout: 5s
  retries: 10
```

The `migrate` service uses `depends_on: db: condition: service_healthy` so migrations do not run against a starting container.

For production:

- Keep the healthcheck. It prevents race conditions during restarts.
- Tune `interval` and `retries` if your storage is slow to recover after reboot.
- Do not disable healthchecks to "speed up" boot. You will get flaky migrations instead.

## Volume persistence

Compose stores data in the named volume `fajita_pg_data`. Without it, container recreation wipes monitors, incidents, and alert history.

- Back up this volume or use `pg_dump` on a schedule. See [BACKUPS.md](./BACKUPS.md).
- Document restore drills before you need them.
- For multi-node or HA Postgres, use an external database and point `DATABASE_URL` at it instead of the bundled `db` service.

## Hardening checklist

| Item | Recommendation |
| --- | --- |
| Password | Set a strong `POSTGRES_PASSWORD` in `.env`; do not use the Compose default in production |
| Exposure | Do not publish port `5432` to the public internet unless required; prefer internal Docker networking |
| TLS | Terminate TLS at your proxy; Postgres itself can use SSL between app and DB when hosted externally |
| Backups | Automated daily dumps minimum; test restore quarterly |
| Keyring | Retain `MONITOR_SECRET_KEYRING` versions during rotation (encrypted monitor secrets depend on them) |
| Updates | Pin Postgres image tags; upgrade during a maintenance window with a fresh backup |

## External Postgres

When `DATABASE_URL` points outside Compose:

- Remove or disable the bundled `db` service in your override file.
- Run migrations with `npm run db:migrate` or your CI job against the external URL.
- Ensure PostgREST (`rest`) and the Go worker can reach the same database.

## Related

- [Backups](./BACKUPS.md)
- [Architecture](./ARCHITECTURE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
