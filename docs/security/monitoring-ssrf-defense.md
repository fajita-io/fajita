# Monitoring SSRF defense

Phase 4. Server-side request forgery prevention is a foundational requirement of
the monitoring engine. Application-level filtering is mandatory even when network
egress filtering exists.

## Layers

1. **URL validation** (`internal/destination/validate.go`). Before any DNS
   lookup: scheme allowlist (`http`, `https` only), port allowlist (`80`, `443`
   by default), reject embedded credentials, control characters, null bytes,
   invalid percent-encoding, excessively long URLs, missing/ambiguous hosts.
2. **IP classification** (`internal/destination/iprules.go`). Every resolved IP
   is checked against a blocked CIDR set and Go's standard IP predicates.
3. **Rebinding-safe dialer** (`internal/destination/dialer.go`). Resolution and
   validation happen immediately before the socket is opened, per connection.
   See `docs/security/dns-rebinding-defense.md`.

## Blocked ranges

IPv4: `0.0.0.0/8`, `10.0.0.0/8`, `100.64.0.0/10` (CGNAT), `127.0.0.0/8`,
`169.254.0.0/16` (link-local, includes `169.254.169.254` cloud metadata),
`172.16.0.0/12`, `192.0.0.0/24`, `192.0.2.0/24`, `192.168.0.0/16`,
`198.18.0.0/15`, `198.51.100.0/24`, `203.0.113.0/24`, `224.0.0.0/4` (multicast),
`240.0.0.0/4` (reserved), `255.255.255.255/32` (broadcast).

IPv6: `::1/128` (loopback), `::/128` (unspecified), `64:ff9b::/96` (NAT64),
`100::/64` (discard), `2001:db8::/32` (documentation), `fc00::/7` (unique-local),
`fe80::/10` (link-local), `ff00::/8` (multicast).

IPv4-mapped IPv6 addresses are unmapped to their IPv4 form before classification,
so `::ffff:10.0.0.1` is blocked as `10.0.0.1`. (An earlier `::ffff:0:0/96` entry
was removed because Go's `IPNet.Contains` over-matched all IPv4 addresses once
they were unmapped; unmapping plus the IPv4 CIDR set is the correct and tested
behavior.)

## Metadata endpoints

`IsMetadataIP` flags cloud/container metadata addresses (for example
`169.254.169.254`) for a distinct, higher-severity security event even though the
link-local range already blocks them.

## Ports

Only `80` and `443` by default. Fajita cannot be used as a port scanner. Any
future extra port requires plan restrictions, abuse controls, and updated legal
and security documentation. Test and lab environments may pass an explicit
`Policy{AllowedPorts: ...}` to permit fixture ports; the default policy still
rejects them, and IP-level SSRF defense always applies at dial time.

## Do not

Do not rely on hostname string matching alone. Validate resolved IPs. Do not
resolve once at monitor creation and assume the destination stays safe.

## Tests

`internal/destination/destination_test.go` covers loopback (v4/v6), private
(v4/v6), link-local, metadata, mixed and mapped notations, DNS resolving to
private IPs, and the default-vs-policy port behavior. Cross-referenced in
`docs/testing/phase-4-security-matrix.md`.
