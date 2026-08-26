# Docker Compose (canonical)

The root [docker-compose.yml](../../docker-compose.yml) is the supported self-hosting path.

```bash
cp .env.example .env
# configure FAJITA_DEPLOYMENT_MODE=self_hosted, Clerk, secrets
docker compose up -d
npm run selfhost:doctor
```

See [docs/self-hosting/QUICKSTART.md](../../docs/self-hosting/QUICKSTART.md) for full setup.

## Services

| Service | Purpose |
| --- | --- |
| `db` | PostgreSQL |
| `rest` | PostgREST |
| `migrate` | One-shot migration runner |
| `web` | Next.js application |
| `monitor-worker` | Go check executor |
| `scheduler` | Cron sidecar |
| `alert-worker` | Notification delivery |

## Production notes

- Put TLS termination in front of the web service (see Caddy/Nginx examples)
- Use strong database credentials instead of Compose defaults
- Persist the PostgreSQL volume and encryption keyring backups
