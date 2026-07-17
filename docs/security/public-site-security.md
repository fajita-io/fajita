# Public site security (Phase 2)

## Attack surface

The public site adds exactly two write endpoints and zero authenticated
surfaces:

- `POST /api/early-access`: stores an email + source label.
- `POST /api/contact`: stores topic, optional name, email, message.

Everything else is static or server-rendered read-only content.

## Controls implemented

| Control | Implementation |
| --- | --- |
| Input validation | Strict server-side checks: email pattern + length, topic allowlist (`isContactTopicId`), message length bounds, source label pattern |
| Rate limiting | In-memory sliding window per client IP (`src/lib/site/rate-limit.ts`): 5/min early access, 3/min contact. DB constraints back it up |
| Spam prevention | Honeypot field (`company`) on both forms; bots get `{ok:true}` with no write |
| Storage | Supabase via PostgREST with the service role key, server-only (`src/lib/supabase/admin-rest.ts`). RLS enabled with no policies: anon/authenticated roles have zero access |
| Idempotency | Early access upserts on unique email (`resolution=ignore-duplicates`) |
| No SSRF | Demos are fixture-only; no user-supplied URL is ever fetched server-side; the product journey makes zero network requests (test-enforced) |
| No secret exposure | Service key used only in `server-only` modules; client bundles carry only `NEXT_PUBLIC_*` values |
| Error hygiene | API errors are generic customer sentences; internal failures log status codes only, never keys or row content |
| Analytics hygiene | No PII in goal metadata; message content never leaves the form |
| Safe external links | No external links with `target="_blank"` without `rel` on customer surfaces; integration cards use our own glyphs |
| Brand Lab protection | `/internal/brand-lab` is dev-only (404 in production), noindex, robots-disallowed |
| Route hygiene | `/api/` and `/internal/` disallowed in robots; login noindexed |

## Known gaps (documented, accepted for this phase)

- **Security headers (CSP, frame, referrer, permissions policies) are
  not yet set.** They belong in `next.config.ts` headers or Vercel
  config and should land with the deployment hardening pass, tested
  against the inline theme script and DataFast script origins. Tracked
  for Phase 3 readiness.
- Rate limiting is per-instance memory; fine for launch-scale spam
  friction, replace with a shared store if abuse appears.
- No email notification on contact messages yet (no sending provider);
  messages sit in `contact_messages` and must be checked. The
  lifecycle-communication phase wires delivery.

## Ten questions (per security-and-privacy rule)

1. Who can initiate: anyone (public forms). 2. Who can view: service
role only. 3. Server-side check: validation + RLS deny-by-default.
4. Data stored: email, source / topic, name, email, message.
5. Where: Supabase Postgres (`early_access_signups`,
`contact_messages`). 6. Retention: until launch migration; deletion on
request. 7. Logged: status codes only. 8. Deletion: service-role delete
by email. 9. Failure: customer keeps input, sees retry guidance.
10. Investigation: rows carry `created_at`; Supabase logs cover access.
