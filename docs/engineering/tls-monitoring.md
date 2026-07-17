# TLS and SSL monitoring

Phase 4. Certificate inspection lives in
`services/monitor-worker/internal/tlscheck`.

## Approach

1. Attempt a verifying TLS handshake.
2. If verification fails, perform a second handshake with verification disabled
   **only to read the presented certificate for classification**. No application
   data is ever sent over the insecure connection.
3. Classify the failure precisely and mark the result as failing. The worker
   never trusts an invalid certificate to report a healthy check.

## Captured

- Hostname
- Certificate subject and issuer summary
- Valid from / valid until
- Days remaining
- Hostname match
- Chain validity
- TLS version
- Certificate fingerprint (where useful)
- Error classification

Full certificate chains are not stored indefinitely.

## Assertions

- Certificate valid
- Hostname matches
- More than N days remain (`expires_after_days`)
- TLS negotiation succeeds

## Failure classification

- `tls_expired` (expired certificate)
- `tls_hostname_mismatch`
- `tls_failure` (untrusted chain, not yet valid, unsupported TLS, handshake
  timeout)
- `connection_refused`

## Timeouts

`isTimeout` uses `errors.As` against `net.Error` so a handshake timeout is
correctly classified rather than reported as a generic error.

## Guarantee

There is no configuration that lets a user bypass TLS validation and still mark a
check healthy. Invalid TLS produces a failing result with an explanatory,
non-sensitive category.
