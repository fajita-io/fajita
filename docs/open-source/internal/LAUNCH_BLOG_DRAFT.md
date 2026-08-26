# Launch blog draft (do not publish)

Working title: **Fajita is now open source**

Alternative: **We open-sourced the uptime monitor that checks twice before waking you up**

---

We built Fajita as a hosted uptime monitor for small software teams. Today we are publishing the core under AGPL-3.0.

That means you can inspect how Fajita verifies failures, self-host the same engine we run in production, or keep using Fajita Cloud when you would rather not operate workers and databases yourself.

## Why we open-sourced it

Monitoring software tells you when something is wrong. You should be able to see how it decides that.

Fajita already focused on clear incident behavior and verification before alerts. Open source is the honest extension of that: same product story, inspectable code.

## What is included

- Website, API, SSL, and heartbeat monitoring
- Failure verification before incidents and alerts
- Incidents, maintenance, and public status pages
- Slack, Discord, webhooks, and email (SMTP or Resend)
- Docker Compose self-hosting path

## Self-host or Cloud

Self-hosted Fajita is not a demo tier. Cloud is not obsolete. Cloud sells operational convenience: managed workers, upgrades, backups, and notifications.

Run it yourself: https://fajita.io/self-host  
Managed option: https://fajita.io/signup  
Source: https://github.com/Accomplish-Labs/fajita-io

## Verification still matters

Most uptime tools alert on the first failed ping. Fajita re-checks before escalating. Open source does not change that behavior. It makes it reviewable.

---

CTA: Star the repo if you want to follow development. Use Cloud if you want it running without operating it.
