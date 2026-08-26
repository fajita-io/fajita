# Legal review checklist (pre-public release)

Engineering checklist only. **Not legal advice.** Have qualified counsel review before public release.

## License

- [x] `LICENSE` contains full AGPL-3.0 text *(engineering verified)*
- [x] `CONTRIBUTING.md` DCO / contribution terms reviewed *(engineering verified)*
- [x] Dependency licenses scanned (`npm run oss:check`, Go modules reviewed) *(engineering verified: npm audit 0 high/critical)*
- [ ] No proprietary SDK terms violated (Clerk, Stripe, Resend, Sentry, DataFast, Anthropic) *(counsel)*

## Trademarks

- [x] `TRADEMARKS.md` published *(engineering verified)*
- [x] README and docs do not imply forks are official Fajita *(engineering verified)*
- [ ] Logo usage guidelines documented *(counsel / brand)*

## Fonts and assets

- [x] Web fonts loaded via `next/font/google` (Fraunces, Instrument Sans, Spline Sans Mono, SIL OFL) *(engineering verified)*
- [x] `fontkit` usage limited to build-time asset export *(engineering verified: `scripts/export-brand-assets.ts` only)*
- [ ] Marketing illustrations and OG images are original or licensed *(counsel)*
- [x] No stock food/restaurant clipart in brand assets *(engineering verified)*

## Content and claims

- [ ] Comparison pages (`/compare/*`) reviewed for accuracy and fair use *(counsel)*
- [x] No false "enterprise-grade" or compliance badges in OSS docs *(engineering verified)*
- [ ] Legal pages (Terms, Privacy, SLA) match actual product behavior *(counsel)*
- [ ] Affiliate program terms reviewed if program remains active at launch *(counsel)*

## Privacy and data

- [ ] Privacy policy covers self-hosted vs Cloud distinction if documented publicly *(counsel)*
- [x] No customer data in repository or CI logs *(engineering verified: oss-check + gitleaks)*
- [ ] GDPR/CCPA subprocessors list accurate (`legal/subprocessors`) *(counsel)*

## Third-party services

- [ ] Clerk Terms compatible with AGPL distribution of integration code *(counsel)*
- [ ] Stripe Connect affiliate terms reviewed *(counsel)*
- [x] Analytics opt-in documented for self-hosted (`docs/self-hosting/TELEMETRY.md`) *(engineering verified)*

## Export control / sanctions

- [ ] Counsel confirms no export restrictions apply to cryptography used (TLS, AES-256-GCM)

## Sign-off

| Role | Name | Date | Approved |
| --- | --- | --- | --- |
| Engineering | Automated gates + smoke test | 2026-08-26 | Yes |
| Legal counsel | | | Pending |

Engineering sign-off evidence:

- `npm run pre-release:verify` passed (2026-08-26)
- Docker Compose clean stack: 47/47 migrations, health + doctor OK
- App-controlled Vercel secrets rotated via `npm run secrets:apply:vercel`
- Production redeploy verified: `https://fajita.io/api/health` returns `ok: true`

Provider secrets still require dashboard rotation before public release (see runbook).
