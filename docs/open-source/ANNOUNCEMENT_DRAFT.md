# Announcement draft (not published)

Internal draft for when Fajita open source goes public. Do not publish until release checklist is complete.

---

**Title:** Fajita is open source

**Subtitle:** Uptime monitoring you can self-host. Verification before alerts. Same product DNA as Fajita Cloud.

---

We're releasing Fajita under **AGPL-3.0**.

Fajita monitors websites, APIs, SSL certificates, cron jobs, and heartbeats. When something fails, it verifies before your team gets paged. Status pages, Slack, Discord, email, and signed webhooks are included.

**Self-host** the full monitoring stack with Docker Compose and your own Clerk instance.

**Fajita Cloud** at [fajita.io](https://fajita.io) remains the managed option for teams who do not want to run it themselves.

### Links

- Repository: `https://github.com/fajita-io/fajita` (update when live)
- Quickstart: `docs/self-hosting/QUICKSTART.md`
- License: AGPL-3.0
- Security: `SECURITY.md`

### What we are not claiming

- Forks are not official Fajita or fajita.io (see `TRADEMARKS.md`)
- Self-hosted installs require your own Clerk, Postgres, and operational care

---

**Channels:** Blog post, social, Hacker News (optional), changelog entry on fajita.io when product team approves.

**Do not publish** until:

1. `npm run pre-release:verify` passes
2. Secrets rotated
3. Legal sign-off recorded
4. Repository is public and Docker images published
