# Upgrading self-hosted Fajita

## Before upgrading

1. **Back up PostgreSQL** (see [BACKUPS.md](./BACKUPS.md)).
2. Record your current version (`/api/health` returns `version`).
3. Export `.env` securely (contains encryption keyring).

## Upgrade steps

```bash
git pull
npm install
npm run db:migrate          # apply new SQL migrations
npm run selfhost:doctor     # verify configuration
docker compose build     # rebuild images
npm run selfhost:down
npm run selfhost:up
```

For non-Docker installs:

```bash
npm run build
npm run start               # or your process manager restart
# Restart Go monitor worker and alert worker processes
```

## Database migrations

Migrations are forward-only SQL files in `supabase/migrations/`. The migrate service tracks applied versions in `public.schema_migrations`.

- **Fresh install**: all migrations apply in order.
- **Existing install**: only pending migrations run.
- Migrations never drop the database on startup.

## Rollback expectations

- Application rollback: redeploy the previous container image or git tag and restart services.
- Database rollback: restore from backup. Down-migrations are not shipped automatically.
- If a migration is irreversible, release notes will say so.

## Zero-downtime

Single-node self-hosted installs should expect brief restarts during upgrade. Run migrations before switching traffic to new web containers.
