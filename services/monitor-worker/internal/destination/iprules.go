// Package destination performs application-layer destination validation for
// every check: URL hygiene, scheme and port allowlists, IP-range blocking
// (SSRF), and DNS-rebinding-safe dialing. This is the security gate; network
// egress restrictions are defense-in-depth, not a substitute (see
// docs/security/monitoring-ssrf-defense.md).
package destination

import (
	"fmt"
	"net"
)

// blockedCIDRs are ranges a monitored destination must never resolve to. This
// list is authored from public special-purpose address registries (RFC 1918,
// 3927, 4193, 4291, 5737, 6598, 6890, 3849) plus well-known cloud/container
// metadata addressing. It complements the net.IP standard checks below.
var blockedCIDRs = mustCIDRs(
	"0.0.0.0/8",          // "this" network
	"10.0.0.0/8",         // private
	"100.64.0.0/10",      // carrier-grade NAT
	"127.0.0.0/8",        // loopback
	"169.254.0.0/16",     // link-local (includes 169.254.169.254 metadata)
	"172.16.0.0/12",      // private
	"192.0.0.0/24",       // IETF protocol assignments
	"192.0.2.0/24",       // documentation (TEST-NET-1)
	"192.168.0.0/16",     // private
	"198.18.0.0/15",      // benchmarking
	"198.51.100.0/24",    // documentation (TEST-NET-2)
	"203.0.113.0/24",     // documentation (TEST-NET-3)
	"224.0.0.0/4",        // multicast
	"240.0.0.0/4",        // reserved
	"255.255.255.255/32", // broadcast
	"::1/128",            // IPv6 loopback
	"::/128",             // IPv6 unspecified
	"64:ff9b::/96",       // NAT64
	"100::/64",           // discard-only
	"2001:db8::/32",      // documentation
	"fc00::/7",           // unique local
	"fe80::/10",          // link-local
	"ff00::/8",           // multicast
)

func mustCIDRs(cidrs ...string) []*net.IPNet {
	out := make([]*net.IPNet, 0, len(cidrs))
	for _, c := range cidrs {
		_, n, err := net.ParseCIDR(c)
		if err != nil {
			panic("destination: bad CIDR " + c + ": " + err.Error())
		}
		out = append(out, n)
	}
	return out
}

// IsBlockedIP reports whether an IP must not be connected to, with a short safe
// reason. It never trusts a hostname string; it operates only on resolved IPs.
// IPv4-mapped IPv6 addresses are unmapped before evaluation so mapped-address
// bypasses do not slip through.
func IsBlockedIP(ip net.IP) (bool, string) {
	if ip == nil {
		return true, "nil address"
	}

	// Normalize IPv4-mapped IPv6 (::ffff:a.b.c.d) to its IPv4 form and evaluate
	// both representations.
	if v4 := ip.To4(); v4 != nil {
		ip = v4
	}

	if ip.IsLoopback() {
		return true, "loopback"
	}
	if ip.IsUnspecified() {
		return true, "unspecified"
	}
	if ip.IsPrivate() {
		return true, "private"
	}
	if ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return true, "link-local"
	}
	if ip.IsMulticast() {
		return true, "multicast"
	}
	if ip.IsInterfaceLocalMulticast() {
		return true, "interface-local-multicast"
	}

	for _, n := range blockedCIDRs {
		if n.Contains(ip) {
			return true, "reserved range " + n.String()
		}
	}
	return false, ""
}

// IsMetadataIP reports whether an IP is a well-known cloud/container metadata
// endpoint, for precise security-event classification. These are already
// blocked by IsBlockedIP; this only refines the reason.
func IsMetadataIP(ip net.IP) bool {
	if v4 := ip.To4(); v4 != nil {
		ip = v4
	}
	// 169.254.169.254 (AWS/GCP/Azure/OpenStack), 100.100.100.200 (Alibaba),
	// fd00:ec2::254 (AWS IMDSv2 IPv6).
	for _, m := range []string{"169.254.169.254", "100.100.100.200", "fd00:ec2::254"} {
		if ip.Equal(net.ParseIP(m)) {
			return true
		}
	}
	return false
}

// ValidateResolvedIPs filters a resolved address set to those safe to connect
// to. It returns the allowed addresses and, when none are allowed, a blocking
// error describing the first blocked address (no customer data leaked).
func ValidateResolvedIPs(ips []net.IP, allowLoopback bool) ([]net.IP, error) {
	allowed := make([]net.IP, 0, len(ips))
	var firstReason string
	for _, ip := range ips {
		if allowLoopback && ip.IsLoopback() {
			allowed = append(allowed, ip)
			continue
		}
		if blocked, reason := IsBlockedIP(ip); blocked {
			if firstReason == "" {
				firstReason = reason
			}
			continue
		}
		allowed = append(allowed, ip)
	}
	if len(allowed) == 0 {
		if firstReason == "" {
			firstReason = "no resolvable address"
		}
		return nil, fmt.Errorf("destination resolves only to blocked addresses (%s)", firstReason)
	}
	return allowed, nil
}
