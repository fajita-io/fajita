# Launch posts (ready to publish)

Publish after the repository is **public** and https://fajita.io/blog/fajita-is-now-open-source returns 200.

Stagger channels by a few hours on launch day. Do not ask for upvotes.

---

## Hacker News (Show HN)

**URL:** https://news.ycombinator.com/submit

**Title:**

```text
Show HN: Fajita – Open-source uptime monitoring that verifies failures before alerting
```

**Body:**

```text
We built Fajita to monitor websites, APIs, SSL certs, and cron jobs for small software teams. Most uptime tools page you on the first failed check. Fajita runs a verification step before opening an incident.

We open-sourced the core under AGPL-3.0.

What it does:
- Scheduled checks from the outside (no agent)
- Verification queue before incidents/alerts
- Incidents, status pages, Slack/Discord/webhooks/email
- Heartbeat URLs for cron jobs

Self-host:

git clone https://github.com/Accomplish-Labs/fajita-io.git
cd fajita-io
cp .env.example .env
docker compose up -d

You bring Clerk (auth), Postgres (included in Compose), and secrets. npm run selfhost:doctor validates config without printing secrets.

Architecture (simplified): Scheduler → Go monitor worker → verification → incident engine → notifications → status page (Postgres underneath)

We still run a managed version at https://fajita.io for teams that do not want to operate workers/backups/upgrades.

License: AGPL-3.0

Repo: https://github.com/Accomplish-Labs/fajita-io
Docs: https://fajita.io/docs/self-hosting/quickstart
Blog: https://fajita.io/blog/fajita-is-now-open-source
```

---

## X

```text
We built Fajita as a hosted uptime monitor. Now the core is open source under AGPL-3.0.

Same idea as always: verify failures before waking anyone up.

Self-host with Docker, or use Fajita Cloud if you do not want to run workers yourself.

https://fajita.io/open-source
https://github.com/Accomplish-Labs/fajita-io
https://fajita.io/blog/fajita-is-now-open-source
```

---

## LinkedIn

**Post:**

```text
Fajita monitors websites, APIs, certificates, and cron jobs. When something fails, we verify before we alert.

Today we published the monitoring core as open source (AGPL-3.0).

If you operate your own infrastructure, you can self-host Fajita with Docker Compose. If you prefer not to run workers, databases, and mail delivery, Fajita Cloud is unchanged.

Open source is about inspectability and trust. Cloud is about operational convenience. Both use the same verification engine.
```

**First comment:**

```text
Open source overview: https://fajita.io/open-source
GitHub: https://github.com/Accomplish-Labs/fajita-io
Self-hosting quickstart: https://fajita.io/docs/self-hosting/quickstart
Launch write-up: https://fajita.io/blog/fajita-is-now-open-source
```

---

## Reddit: r/selfhosted

**Title:** Fajita – self-hostable uptime monitoring with verification before alerts (AGPL-3.0)

**Body:**

```text
We open-sourced Fajita, an uptime monitor we have been running as a hosted product. Posting here because self-hosting is a first-class path, not a demo tier.

Stack: Docker Compose, Postgres, PostgREST, Next.js web app, Go monitor worker, scheduler sidecar. You bring your own Clerk app for auth.

What it monitors: websites, APIs, SSL certificates, cron/heartbeat jobs.

Differentiator: verification before incidents/alerts (re-checks before paging you).

Quick start:

git clone https://github.com/Accomplish-Labs/fajita-io.git
cd fajita-io
cp .env.example .env
docker compose up -d

Docs walk through Clerk, env vars, and npm run selfhost:doctor.

Self-hosted instances do not phone home to Fajita by default.

Managed option if you do not want to run it: https://fajita.io/signup

Would appreciate feedback on the install docs if you try it.
```

---

## Reddit: r/devops

**Title:** We open-sourced Fajita (uptime monitoring with a verification step before paging)

**Body:**

```text
Fajita is uptime monitoring for websites, APIs, SSL, and heartbeats. We published the core under AGPL-3.0.

Technical bits that might interest this sub:
- Go worker executes checks and drains a verification queue
- Scheduler hits cron endpoints; self-host uses Compose sidecar + worker loop
- Postgres is source of truth; incidents/alerts/status pages share one engine
- SSRF controls on outbound checks (private network blocked by default)
- Self-host and Cloud run the same codebase; deployment mode switches billing/telemetry

Repo: https://github.com/Accomplish-Labs/fajita-io
Architecture: https://fajita.io/docs/open-source/architecture

Happy to answer questions on verification logic or worker layout.
```

---

## Reddit: r/opensource

**Title:** Fajita – AGPL uptime monitoring (websites, APIs, SSL, cron/heartbeat)

**Body:**

```text
Fajita is now open source under AGPL-3.0: https://github.com/Accomplish-Labs/fajita-io

Includes monitoring, failure verification, incidents, status pages, Slack/Discord/webhooks/email, and Docker Compose self-hosting.

License: AGPL-3.0 (see LICENSE)
Contributing: CONTRIBUTING.md
Security: SECURITY.md (private reports only)
Trademarks: TRADEMARKS.md (source license ≠ brand license)

We also operate Fajita Cloud at https://fajita.io for managed hosting.
```

---

## Product Hunt

**Action:** Update existing product page + Ship update (do not create duplicate listing). See PRODUCT_HUNT_RELAUNCH.md.

**Maker comment:**

```text
We open-sourced the Fajita monitoring core today under AGPL-3.0.

Same product as before for Cloud customers. New for operators: self-host with Docker Compose, inspect verification logic, contribute on GitHub.

Self-host: https://fajita.io/self-host
Source: https://github.com/Accomplish-Labs/fajita-io
Write-up: https://fajita.io/blog/fajita-is-now-open-source

Cloud is still the easiest way to run it if you do not want workers and databases on your plate.
```

---

## Dev.to / Hashnode

Republish or cross-post https://fajita.io/blog/fajita-is-now-open-source with canonical URL set to fajita.io.

---

## Indie Hackers

**Title:** Open-sourced our uptime monitoring SaaS (still running Cloud)

**Body:** Adapt launch blog. Emphasize: Cloud still exists, OSS for trust/distribution, low-maintenance stewardship, feedback welcome on self-host docs.
