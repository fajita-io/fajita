# Good first issues (launch prep)

Internal list of low-risk tasks suitable for `good first issue` labels at public launch. Do not mark security architecture or billing enforcement work as beginner-friendly.

## Documentation

1. Expand reverse proxy examples (Traefik) mirroring Caddy/Nginx patterns
2. Add FAQ entries for Clerk webhook tunnel setup during local dev
3. Cross-link architecture docs from self-hosting README
4. Verify all Quick Start commands on Linux and document OS-specific notes

## Integrations

5. Improve Discord alert error messages when webhook URL is invalid
6. Document signed webhook verification with `example.com` sample payload
7. Add troubleshooting entry for SMTP STARTTLS vs SMTPS confusion

## Monitoring

8. Add unit test coverage for an additional assertion edge case (document which assertion in issue)
9. Clarify verification threshold copy in monitor settings UI (copy-only PR)

## Accessibility

10. Fix a single focus-ring or aria-label defect on monitor list (file issue with route)

## Self-hosting

11. Compose healthcheck documentation for production postgres hardening
12. Example `.env` comment improvements without adding overlapping templates

## Process

- Create GitHub issues from this list at launch
- Apply `good first issue` only when acceptance criteria are clear
- Apply `help wanted` for slightly larger but still bounded tasks
