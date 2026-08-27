# Initial OSS release notes (draft)

**Do not publish until repository is public and `v0.1.0` tag is cut.**

## Fajita is open source

Fajita is now available as an open-source, self-hostable uptime monitoring platform under **AGPL-3.0**.

## What's included

- Website, API, SSL, and heartbeat monitoring
- Failure verification before incidents and alerts
- Incident lifecycle with public status pages
- Slack, Discord, email, and signed webhook notifications
- Docker Compose self-hosting path
- [Fajita Cloud](https://fajita.io) for managed operation

## Quick start

```bash
git clone https://github.com/fajita-io/fajita.git
cd fajita
cp .env.example .env
docker compose up -d
```

See [Self-hosting quickstart](https://github.com/fajita-io/fajita/blob/main/docs/self-hosting/QUICKSTART.md) for Clerk and configuration details.

## Docker images

Published on tag to GitHub Container Registry:

- `ghcr.io/fajita-io/fajita-web`
- `ghcr.io/fajita-io/fajita-monitor-worker`
- `ghcr.io/fajita-io/fajita-worker`

## Upgrade notes

First release. No upgrade path from prior public tags.

## Security

Report vulnerabilities per [SECURITY.md](https://github.com/fajita-io/fajita/blob/main/SECURITY.md).

## Trademarks

The software is open source. Fajita trademarks and fajita.io brand assets remain protected. See [TRADEMARKS.md](https://github.com/fajita-io/fajita/blob/main/TRADEMARKS.md).
