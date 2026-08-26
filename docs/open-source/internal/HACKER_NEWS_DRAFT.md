# Hacker News draft (do not post)

Title: **Show HN: Fajita – Open-source uptime monitoring that verifies failures before alerting**

---

We built Fajita to monitor websites, APIs, SSL certs, and cron jobs for small software teams. Most uptime tools page you on the first failed check. Fajita runs a verification step before opening an incident.

We are open-sourcing the core today under AGPL-3.0.

**What it does**

- Scheduled checks from the outside (no agent)
- Verification queue before incidents/alerts
- Incidents, status pages, Slack/Discord/webhooks/email
- Heartbeat URLs for cron jobs

**Self-host**

```bash
git clone https://github.com/Accomplish-Labs/fajita-io.git
cd fajita-io
cp .env.example .env
docker compose up -d
```

You bring Clerk (auth), Postgres (included in Compose), and secrets. `npm run selfhost:doctor` validates config without printing secrets.

**Architecture (simplified)**

Scheduler → Go monitor worker → verification → incident engine → notifications → status page (Postgres underneath)

**Cloud**

We still run a managed version at https://fajita.io for teams that do not want to operate workers/backups/upgrades. Same codebase, different operational burden.

**License:** AGPL-3.0

Happy to answer questions on verification logic, self-hosting, or what we deliberately left out of v1 OSS.

Repo: https://github.com/Accomplish-Labs/fajita-io  
Docs: https://fajita.io/docs/self-hosting/quickstart
