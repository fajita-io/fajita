# Self-hosted backups

## Must back up

| Asset | Why |
| --- | --- |
| PostgreSQL | Monitors, results, incidents, alerts, billing cache, all product state |
| `MONITOR_SECRET_KEYRING` | Without it, encrypted monitor secrets cannot be decrypted |
| `.env` / configuration | Clerk IDs, cron secret, SMTP credentials (store encrypted at rest) |

## Should back up

| Asset | Why |
| --- | --- |
| Clerk configuration | Export from Clerk dashboard for disaster recovery |
| Custom status domain DNS records | If using custom domains |

## Optional

Object storage is not required for core monitoring. If you add S3-compatible storage later, include those buckets in backup policy.

## PostgreSQL backup example

```bash
pg_dump "$DATABASE_URL" -Fc -f "fajita-$(date +%Y%m%d).dump"
```

Restore:

```bash
pg_restore -d "$DATABASE_URL" --clean --if-exists fajita-YYYYMMDD.dump
```

For Docker Compose:

```bash
docker compose exec db pg_dump -U postgres -Fc postgres > fajita.dump
```

## Encryption key warning

Rotating or losing `MONITOR_SECRET_KEYRING` without retaining old versions makes existing encrypted monitor headers and subscriber email ciphertext **unrecoverable**. Keep prior key versions in the keyring during rotation:

```text
MONITOR_SECRET_KEYRING=1:<old>,2:<new>
```

## Backup frequency

Match your incident tolerance. Daily automated backups with point-in-time recovery (if your Postgres host supports it) is a reasonable production baseline.
