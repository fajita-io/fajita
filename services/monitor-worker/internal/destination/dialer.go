package destination

import (
	"context"
	"fmt"
	"net"
	"time"
)

// Resolver resolves a hostname to IP addresses. Abstracted so tests can inject
// rebinding / private-IP scenarios.
type Resolver interface {
	LookupIP(ctx context.Context, host string) ([]net.IP, error)
}

type systemResolver struct{}

func (systemResolver) LookupIP(ctx context.Context, host string) ([]net.IP, error) {
	addrs, err := net.DefaultResolver.LookupIPAddr(ctx, host)
	if err != nil {
		return nil, err
	}
	ips := make([]net.IP, 0, len(addrs))
	for _, a := range addrs {
		ips = append(ips, a.IP)
	}
	return ips, nil
}

// Guard performs DNS-rebinding-safe dialing. Resolution happens inside
// DialContext immediately before the connection, every time, so a hostname that
// resolves to a public address at validation time cannot rebind to a private
// address at connection time: the connection is pinned to the IP we validated.
type Guard struct {
	AllowLoopback bool
	Resolver      Resolver
	DialTimeout   time.Duration
}

func (g *Guard) resolver() Resolver {
	if g.Resolver != nil {
		return g.Resolver
	}
	return systemResolver{}
}

func (g *Guard) dialTimeout() time.Duration {
	if g.DialTimeout > 0 {
		return g.DialTimeout
	}
	return 5 * time.Second
}

// DialBlockError is returned when a resolved address is blocked. It carries a
// safe reason and whether a metadata endpoint was targeted, for security-event
// classification. It never includes customer response data.
type DialBlockError struct {
	Reason     string
	IsMetadata bool
	IsPrivate  bool
}

func (e *DialBlockError) Error() string { return "destination blocked: " + e.Reason }

// DialContext resolves, validates every returned address, and connects only to
// a validated address. It is installed as http.Transport.DialContext so the
// HTTP client never performs its own uncontrolled resolution.
func (g *Guard) DialContext(ctx context.Context, network, addr string) (net.Conn, error) {
	host, portStr, err := net.SplitHostPort(addr)
	if err != nil {
		return nil, &DialBlockError{Reason: "invalid dial address"}
	}

	var ips []net.IP
	if literal := net.ParseIP(host); literal != nil {
		ips = []net.IP{literal}
	} else {
		resolved, rErr := g.resolver().LookupIP(ctx, host)
		if rErr != nil {
			return nil, rErr // DNS failure, classified upstream as dns_failure
		}
		ips = resolved
	}

	// Classify before filtering so we can label metadata / private attempts.
	blockedMeta, blockedPriv := false, false
	for _, ip := range ips {
		if IsMetadataIP(ip) {
			blockedMeta = true
		}
		if blocked, reason := IsBlockedIP(ip); blocked && reason == "private" {
			blockedPriv = true
		}
	}

	allowed, vErr := ValidateResolvedIPs(ips, g.AllowLoopback)
	if vErr != nil {
		return nil, &DialBlockError{
			Reason:     vErr.Error(),
			IsMetadata: blockedMeta,
			IsPrivate:  blockedPriv,
		}
	}

	d := net.Dialer{Timeout: g.dialTimeout()}
	var lastErr error
	for _, ip := range allowed {
		conn, dErr := d.DialContext(ctx, network, net.JoinHostPort(ip.String(), portStr))
		if dErr == nil {
			return conn, nil
		}
		lastErr = dErr
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("no validated address reachable")
	}
	return nil, lastErr
}
