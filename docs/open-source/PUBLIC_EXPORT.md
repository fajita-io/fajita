# Public export checklist

Use this when creating the public GitHub repository from the private monorepo.

## Exclude from public export

| Path | Reason |
| --- | --- |
| `.cursor/mcp.json` | May contain Supabase project ref |
| `.cursor/hooks/supabase-migrate.log` | Production ops log |
| `.env`, `.env.*` (except `.env.example`) | Secrets |
| `docs/handoff/*` | Internal ownership manifests, production refs |
| `.qa-screens/` | Internal QA |
| `.headroom/`, `CLAUDE.local.md` | Local agent artifacts |

## Redact before export (optional)

| Path | Action |
| --- | --- |
| `.cursor/rules/supabase-migrations.mdc` | Replace project ref with `<your-project-ref>` |
| `scripts/supabase-push.sh` | Parameterize `ALLOWED_REF` or document as cloud-only |
| Internal email addresses in scripts | Replace with `ops@your-domain.example` |

## Include in public export

- `LICENSE` (AGPL-3.0)
- `CONTRIBUTING.md`, `SECURITY.md`, `TRADEMARKS.md`
- `docs/open-source/*`, `docs/self-hosting/*`
- Application source, migrations, Docker assets
- `.github/workflows/*`

## Pre-export commands

```bash
npm run oss:check
npm run oss:selfhost-check:fast
# gitleaks runs in CI (.github/workflows/oss-readiness.yml)
```

## Post-export

1. Rotate all secrets in `SECRET_ROTATION_RUNBOOK.md`
2. Enable branch protection on `main`
3. Enable GitHub secret scanning + push protection
4. Verify CI green on first public commit

## Automated check

`scripts/oss-check.ts` fails on tracked `.env` files, private keys, and credential patterns outside allowlisted paths.
