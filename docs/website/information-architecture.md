# Public site information architecture (Phase 2)

## Route inventory

| Route | Render | Index | Purpose |
| --- | --- | --- | --- |
| `/` | Static | Yes | Category clarity, directed product story, conversion |
| `/pricing` | Static | Yes | Plan structure, honest pre-launch pricing |
| `/features` | Static | Yes | Workflow hub: Watch, Verify, Alert, Communicate, Learn |
| `/features/uptime-monitoring` | SSG | Yes | Website checks |
| `/features/api-monitoring` | SSG | Yes | API assertions |
| `/features/ssl-monitoring` | SSG | Yes | Certificate expiry |
| `/features/cron-monitoring` | SSG | Yes | Heartbeats and silent jobs |
| `/features/status-pages` | SSG | Yes | Customer-facing status |
| `/features/incident-communication` | SSG | Yes | Incident lifecycle |
| `/integrations` | Static | Yes | Email, Slack, Discord, webhooks |
| `/security` | Static | Yes | Controls with honest status labels |
| `/about` | Static | Yes | Why Fajita exists; the name |
| `/contact` | Dynamic | Yes | Topic-routed contact form |
| `/changelog` | Static | Yes | Truthful shipped entries |
| `/roadmap` | Static | Yes | Direction without dates |
| `/status` | Static | Yes | Truthful placeholder; Phase 8 replaces |
| `/signup` | Static | Yes | Early access capture |
| `/login` | Static | **No** | Honest pre-launch login; noindex |
| `/legal` | Static | Yes | Legal hub; documents publish at launch |
| `not-found` (404) | Static | No | Branded, useful |
| `error` (500) | Client boundary | No | Calm recovery |
| `/api/early-access` | Route handler | No | POST only |
| `/api/contact` | Route handler | No | POST only |
| `/internal/brand-lab` | Dev only | No | 404 in production |

## Navigation model

Desktop header: Features (dropdown with six items + hub), Pricing,
Integrations, Security, Company (About, Changelog, Roadmap, Contact,
Service status), Log in, primary CTA. Mobile: composed full-screen panel
with grouped links and stacked CTAs; body scroll locks; Escape closes.

Footer: Product column (six features + pricing), Company column (about,
contact, security, changelog, roadmap, status), Legal column (legal hub),
address block, theme toggle, and the Thermal Stack footer moment with
the closing CTA.

## Rules for adding routes

1. Decide index intent before shipping; noindex internal or incomplete.
2. Add `buildMetadata` (unique title, description, canonical).
3. Add to `src/app/sitemap.ts` if indexable.
4. Update `llms.txt` when positioning or key URLs change.
5. Register any new capability statements in `src/lib/site/claims.ts`.
6. Never link to a route whose content does not meet editorial standards.
