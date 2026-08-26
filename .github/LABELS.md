# GitHub label taxonomy

Apply these labels when triaging issues and pull requests. Create them in repository Settings → Labels before public launch if they do not exist yet.

| Label | Color suggestion | Use for |
| --- | --- | --- |
| `bug` | `#d73a4a` | Reproducible defects |
| `feature` | `#a2eeef` | New capability requests |
| `documentation` | `#0075ca` | Docs only changes |
| `security` | `#b60205` | Security fixes (not public vuln reports) |
| `good first issue` | `#7057ff` | Low-risk starter tasks |
| `help wanted` | `#008672` | Maintainer welcomes external help |
| `monitoring` | `#fbca04` | Check engine, verification, schedules |
| `status-pages` | `#5319e7` | Public status surfaces |
| `integrations` | `#1d76db` | Slack, Discord, webhooks, email |
| `self-hosting` | `#006b75` | Docker, compose, operator docs |
| `performance` | `#e99695` | Latency, worker throughput |
| `design` | `#d4c5f9` | UI/UX and visual system |

## Guidelines

- Use one primary type label (`bug`, `feature`, `documentation`)
- Add area labels when they help discovery
- Do not mark security architecture work as `good first issue`
- Close duplicate issues with a link to the canonical thread

## Automation

Run at launch (works on private repo):

```bash
GITHUB_TOKEN=ghp_... npm run github:launch-setup
```

See `scripts/github-launch-setup.ts` and [LAUNCH_EXECUTION.md](../docs/open-source/LAUNCH_EXECUTION.md).

Upload social preview manually: `.github/assets/github-social-preview.png`
