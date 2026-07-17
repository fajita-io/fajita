package destination

import (
	"errors"
	"fmt"
	"net/url"
	"strconv"
	"strings"

	contracts "github.com/fajita-io/monitor-contracts"
)

// BlockReason categorizes why a destination was rejected, mapping to a failure
// category and security-event type for the caller.
type BlockReason string

const (
	ReasonUnsupportedScheme BlockReason = "unsupported_scheme"
	ReasonBlockedPort       BlockReason = "blocked_port"
	ReasonInvalidURL        BlockReason = "invalid_url"
	ReasonEmbeddedCreds     BlockReason = "embedded_credentials"
	ReasonBlockedAddress    BlockReason = "blocked_destination"
)

// ValidationError carries a safe, non-leaking reason for a rejected target.
type ValidationError struct {
	Reason  BlockReason
	Message string
}

func (e *ValidationError) Error() string { return e.Message }

func blockErr(r BlockReason, format string, a ...any) *ValidationError {
	return &ValidationError{Reason: r, Message: fmt.Sprintf(format, a...)}
}

const maxURLLength = 2048

// Target is a validated destination.
type Target struct {
	Scheme     string
	Host       string // hostname, no port
	Port       int
	Normalized string // scheme://host[:port]/path?query
	HostPort   string // host:port for dialing/Host header
}

// Policy controls the port allowlist. Production uses the default (80, 443);
// tests and the internal lab may permit fixture ports without weakening IP-level
// SSRF defense (which always applies at dial time).
type Policy struct {
	AllowedPorts []int
}

func (p Policy) allowedPorts() []int {
	if len(p.AllowedPorts) == 0 {
		return contracts.AllowedPorts
	}
	return p.AllowedPorts
}

// ValidateURL enforces URL hygiene and the scheme/port allowlists using the
// default policy.
func ValidateURL(raw string) (*Target, error) {
	return Policy{}.ValidateURL(raw)
}

// ValidateURL enforces URL hygiene and the scheme/port allowlists. It does not
// resolve DNS; the guarded dialer does that per connection so rebinding cannot
// be cached (see dialer.go). A rejected URL never mutates into a different
// destination silently.
func (p Policy) ValidateURL(raw string) (*Target, error) {
	if raw == "" {
		return nil, blockErr(ReasonInvalidURL, "empty URL")
	}
	if len(raw) > maxURLLength {
		return nil, blockErr(ReasonInvalidURL, "URL exceeds %d bytes", maxURLLength)
	}
	if strings.ContainsAny(raw, "\x00\r\n\t") {
		return nil, blockErr(ReasonInvalidURL, "URL contains control characters")
	}
	if strings.ContainsRune(raw, ' ') {
		return nil, blockErr(ReasonInvalidURL, "URL contains whitespace")
	}

	u, err := url.Parse(raw)
	if err != nil {
		return nil, blockErr(ReasonInvalidURL, "unparseable URL")
	}

	scheme := strings.ToLower(u.Scheme)
	if !contains(contracts.AllowedSchemes, scheme) {
		return nil, blockErr(ReasonUnsupportedScheme, "scheme %q is not allowed", scheme)
	}

	if u.User != nil {
		return nil, blockErr(ReasonEmbeddedCreds, "URL must not contain embedded credentials")
	}

	host := u.Hostname()
	if host == "" {
		return nil, blockErr(ReasonInvalidURL, "URL has no host")
	}
	// Reject ambiguous/obfuscated host representations that string checks miss.
	if strings.Contains(host, "..") || strings.HasPrefix(host, ".") {
		return nil, blockErr(ReasonInvalidURL, "ambiguous host")
	}

	port, err := resolvePort(u, scheme)
	if err != nil {
		return nil, err
	}
	if !contains(p.allowedPorts(), port) {
		return nil, blockErr(ReasonBlockedPort, "port %d is not allowed", port)
	}

	hostPort := net_JoinHostPort(host, port)
	u.Host = hostPort
	normalized := u.String()

	return &Target{
		Scheme:     scheme,
		Host:       host,
		Port:       port,
		Normalized: normalized,
		HostPort:   hostPort,
	}, nil
}

func resolvePort(u *url.URL, scheme string) (int, error) {
	p := u.Port()
	if p == "" {
		if scheme == "https" {
			return 443, nil
		}
		return 80, nil
	}
	n, err := strconv.Atoi(p)
	if err != nil || n <= 0 || n > 65535 {
		return 0, blockErr(ReasonInvalidURL, "invalid port")
	}
	return n, nil
}

func contains[T comparable](s []T, v T) bool {
	for _, x := range s {
		if x == v {
			return true
		}
	}
	return false
}

// net_JoinHostPort wraps IPv6 literals in brackets when joining.
func net_JoinHostPort(host string, port int) string {
	if strings.Contains(host, ":") && !strings.HasPrefix(host, "[") {
		return "[" + host + "]:" + strconv.Itoa(port)
	}
	return host + ":" + strconv.Itoa(port)
}

// ErrBlocked is returned by the dialer when a resolved address is blocked.
var ErrBlocked = errors.New("destination blocked")
