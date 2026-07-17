# DNS-rebinding defense

Phase 4. DNS can change between validation and connection. The worker closes
that gap by resolving and validating immediately before every dial.

## Required sequence

1. Parse and validate the URL (scheme, port, host hygiene).
2. Resolve the hostname using the approved resolver.
3. Validate **every** returned address against the blocked ranges.
4. Select an allowed address.
5. Connect to that validated address.
6. Preserve the original hostname for TLS SNI and the HTTP `Host` header.
7. Prevent the HTTP client from performing a new uncontrolled resolution.
8. Revalidate every redirect target.
9. Repeat for every execution; never cache a "safe" verdict across runs.

## Implementation

`internal/destination/dialer.go` provides a `Guard` with a pluggable `Resolver`
and a `DialContext` used by the HTTP transport. `DialContext`:

- Resolves the host at dial time (not once at monitor creation)
- Runs `ValidateResolvedIPs` on the returned set
- Dials the validated IP directly while the transport keeps the original
  hostname for SNI/`Host`
- Returns a typed `DialBlockError` (with an `IsPrivate`/metadata classification)
  so the executor records a safe security event

Because resolution and validation are atomic at dial time, a rebinding attack
that flips a name from a public to a private address between checks is caught on
the connecting execution.

## Rejection conditions

A check is rejected (status `blocked`) when:

- All resolved addresses are blocked
- A redirect target fails revalidation
- Resolution is ambiguous in a way that cannot be secured

Each rejection logs a safe security event without leaking sensitive customer
data (see `docs/observability/monitoring-engine.md`).

## Tests

`TestDialContextBlocksPrivateResolution` and related cases in
`destination_test.go` inject a `fakeResolver` that returns private IPs and assert
a `DialBlockError` with the correct classification. The redirect-to-private and
redirect-to-metadata paths are covered in the executor tests.
