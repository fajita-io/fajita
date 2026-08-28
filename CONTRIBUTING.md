# Contributing to Fajita

Thank you for helping improve Fajita. Contributions are licensed under **AGPL-3.0**. By submitting a pull request, you agree your work is licensed under the same terms.

## Code of conduct

Participate respectfully. See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## Before you start

1. Search existing issues for duplicates
2. For large changes, open an issue first to align on approach
3. Read [docs/contributing/DEVELOPMENT.md](./docs/contributing/DEVELOPMENT.md)
4. For UI work, read [docs/contributing/DESIGN.md](./docs/contributing/DESIGN.md)

## Development setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Self-hosted stack:

```bash
cp .env.example .env
# FAJITA_DEPLOYMENT_MODE=self_hosted
docker compose up -d
```

## Choosing work

- `good first issue` and `help wanted` labels mark approachable tasks
- Avoid grabbing core security or architecture issues without maintainer alignment

## Branch and commit expectations

- Branch from `main` with a descriptive name (`fix/monitor-timeout`, `docs/selfhost-proxy`)
- Keep commits focused; squash locally if helpful before review
- Use imperative commit subjects; explain **why** in the body when needed

## Code expectations

- Match existing patterns in the file you touch
- No unnecessary dependencies
- No speculative abstractions
- No secrets in commits (env files, tokens, dumps)
- Preserve SSRF protections and tenant isolation in monitoring paths
- Do not weaken security checks without discussion
- Do not break monitor behavior silently; document behavior changes

## Tests

- Add or update tests for behavior changes
- Run before opening a PR:

```bash
npm run oss:check:fast
npm run oss:selfhost-check:fast
```

Go worker changes:

```bash
cd services/monitor-worker && go test ./...
```

## Pull request expectations

Use the PR template. Include:

- What changed and why
- Tests run
- Screenshots for UI changes
- Migration, env, and security notes when applicable
- Documentation updates for operator-facing changes

## Documentation

- Public docs must not include internal phase language or Cursor prompts
- Commands in docs must work as written
- Follow voice rules: clear, precise, no hype, no em dashes in customer-facing copy

## Security disclosure

Report vulnerabilities privately via [SECURITY.md](./SECURITY.md). Do not open public issues for exploitable problems.

## Developer Certificate of Origin

By contributing, you certify that:

1. You created the contribution and have the right to submit it under AGPL-3.0
2. You understand the project license applies to your contribution
3. Your contribution does not knowingly include third-party material incompatible with AGPL-3.0

## Questions

Use GitHub Discussions on [fajita-io/fajita](https://github.com/fajita-io/fajita/discussions) for questions. For security issues, use [SECURITY.md](./SECURITY.md).
