# HTTP client

Phase 4. The worker's HTTP execution uses an independently configured client
(`services/monitor-worker/internal/httpcheck`). It does not reuse any competitor
client configuration.

## Timeouts

- Explicit connect timeout (via the guarded dialer)
- Explicit TLS-handshake timeout
- Explicit response-header timeout
- Explicit total request timeout (`timeout_ms` from monitor config)

## Connection controls

- Bounded idle connections and connections per host
- No proxy inheritance from environment variables (the transport does not read
  `HTTP_PROXY`/`HTTPS_PROXY`)
- No automatic cookie jar; no persistent customer cookies
- Custom `DialContext` from the destination `Guard` so every connection resolves
  and validates DNS immediately before dialing (see
  `docs/security/dns-rebinding-defense.md`)

## Redirects

The standard client's automatic redirect behavior is not trusted. `CheckRedirect`
runs `Policy.ValidateURL` on every redirect target and:

- Enforces a maximum redirect count (default 5 or lower)
- Rejects redirects to blocked IPs, unsupported schemes, or unsupported ports
- Strips `Authorization` and cookies when the host changes
- Records the final URL and redirect count

See `docs/engineering` redirect notes and the executor tests.

## Response limits

- Bounded response-body read (`body_size_limit_bytes`); reading stops safely at
  the limit and the result is classified `response_too_large` when exceeded
- Bounded assertion scan length
- Response content is never executed
- Full response bodies are not persisted; only bounded, sanitized diagnostic
  snippets where justified

## TLS

- Certificate validation is enabled for production checks and is never disabled
- Minimum approved TLS version enforced
- A monitor may *report* invalid TLS, but the worker never silently trusts an
  invalid certificate to mark a check healthy (see
  `docs/engineering/tls-monitoring.md`)

## Identity

Requests send a User-Agent identifying Fajita monitoring
(`Fajita-Monitor/1.0 (+https://fajita.io/monitoring)`), configurable via
`MONITOR_WORKER_USER_AGENT`. Customers cannot spoof the worker identity through
request headers; hop-by-hop and identity-sensitive headers are controlled (see
`docs/security/monitoring-abuse-prevention.md`).

## Timing

DNS, connect, TLS, time-to-first-byte, and total durations are captured via
`httptrace`. Because the guarded dialer performs resolution, DNS timing is
recorded from the dial path.
