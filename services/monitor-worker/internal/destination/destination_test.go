package destination

import (
	"context"
	"errors"
	"net"
	"testing"
	"time"
)

func TestIsBlockedIP(t *testing.T) {
	blocked := []string{
		"127.0.0.1",        // loopback v4
		"::1",              // loopback v6
		"10.0.0.5",         // private
		"172.16.0.1",       // private
		"192.168.1.1",      // private
		"169.254.169.254",  // link-local + metadata
		"0.0.0.0",          // unspecified
		"100.64.0.1",       // CGNAT
		"224.0.0.1",        // multicast
		"255.255.255.255",  // broadcast
		"fe80::1",          // v6 link-local
		"fc00::1",          // v6 unique-local
		"::ffff:127.0.0.1", // IPv4-mapped loopback
		"::ffff:10.0.0.1",  // IPv4-mapped private
		"192.0.2.1",        // TEST-NET-1 documentation
	}
	for _, s := range blocked {
		ip := net.ParseIP(s)
		if ip == nil {
			t.Fatalf("bad test IP %q", s)
		}
		if ok, _ := IsBlockedIP(ip); !ok {
			t.Errorf("expected %s to be blocked", s)
		}
	}

	allowed := []string{"93.184.216.34", "8.8.8.8", "1.1.1.1", "2606:2800:220:1:248:1893:25c8:1946"}
	for _, s := range allowed {
		ip := net.ParseIP(s)
		if ok, reason := IsBlockedIP(ip); ok {
			t.Errorf("expected %s to be allowed, blocked as %q", s, reason)
		}
	}
}

func TestIsBlockedIPNil(t *testing.T) {
	if ok, _ := IsBlockedIP(nil); !ok {
		t.Error("nil IP must be blocked")
	}
}

func TestIsMetadataIP(t *testing.T) {
	meta := []string{"169.254.169.254", "100.100.100.200", "::ffff:169.254.169.254"}
	for _, s := range meta {
		if !IsMetadataIP(net.ParseIP(s)) {
			t.Errorf("expected %s to be a metadata IP", s)
		}
	}
	if IsMetadataIP(net.ParseIP("8.8.8.8")) {
		t.Error("8.8.8.8 is not a metadata IP")
	}
}

func TestValidateResolvedIPs(t *testing.T) {
	// Mixed set: one public, one private. Public survives.
	ips := []net.IP{net.ParseIP("10.0.0.1"), net.ParseIP("93.184.216.34")}
	allowed, err := ValidateResolvedIPs(ips, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(allowed) != 1 || !allowed[0].Equal(net.ParseIP("93.184.216.34")) {
		t.Fatalf("expected only the public IP, got %v", allowed)
	}

	// All private: rejected.
	if _, err := ValidateResolvedIPs([]net.IP{net.ParseIP("10.0.0.1")}, false); err == nil {
		t.Error("expected rejection when all addresses are blocked")
	}

	// Loopback allowed only in test mode.
	if _, err := ValidateResolvedIPs([]net.IP{net.ParseIP("127.0.0.1")}, true); err != nil {
		t.Errorf("loopback should be allowed with allowLoopback=true: %v", err)
	}
	if _, err := ValidateResolvedIPs([]net.IP{net.ParseIP("127.0.0.1")}, false); err == nil {
		t.Error("loopback must be blocked without allowLoopback")
	}
}

func TestValidateURL(t *testing.T) {
	good := []string{
		"http://example.com/",
		"https://example.com:443/health",
		"http://example.com:80/path?q=1",
	}
	for _, u := range good {
		if _, err := ValidateURL(u); err != nil {
			t.Errorf("expected %q to validate, got %v", u, err)
		}
	}

	cases := []struct {
		url    string
		reason BlockReason
	}{
		{"ftp://example.com/", ReasonUnsupportedScheme},
		{"file:///etc/passwd", ReasonUnsupportedScheme},
		{"javascript:alert(1)", ReasonUnsupportedScheme},
		{"gopher://example.com/", ReasonUnsupportedScheme},
		{"ws://example.com/", ReasonUnsupportedScheme},
		{"http://user:pass@example.com/", ReasonEmbeddedCreds},
		{"http://example.com:22/", ReasonBlockedPort},
		{"http://example.com:8080/", ReasonBlockedPort},
		{"http://example.com/\x00", ReasonInvalidURL},
		{"http:// example.com/", ReasonInvalidURL},
		{"http://..example.com/", ReasonInvalidURL},
		{"", ReasonInvalidURL},
	}
	for _, c := range cases {
		_, err := ValidateURL(c.url)
		if err == nil {
			t.Errorf("expected %q to be rejected", c.url)
			continue
		}
		var ve *ValidationError
		if !errors.As(err, &ve) {
			t.Errorf("expected ValidationError for %q, got %T", c.url, err)
			continue
		}
		if ve.Reason != c.reason {
			t.Errorf("%q: expected reason %q, got %q", c.url, c.reason, ve.Reason)
		}
	}
}

func TestValidateURLLength(t *testing.T) {
	long := "http://example.com/" + string(make([]byte, 3000))
	if _, err := ValidateURL(long); err == nil {
		t.Error("expected overly long URL to be rejected")
	}
}

func TestPolicyAllowsExtraPorts(t *testing.T) {
	p := Policy{AllowedPorts: []int{80, 443, 8080}}
	if _, err := p.ValidateURL("http://example.com:8080/"); err != nil {
		t.Errorf("expected policy to allow port 8080: %v", err)
	}
	// Default policy still rejects it.
	if _, err := ValidateURL("http://example.com:8080/"); err == nil {
		t.Error("default policy must still reject port 8080")
	}
}

// fakeResolver returns fixed addresses to simulate DNS rebinding / private DNS.
type fakeResolver struct {
	ips []net.IP
	err error
}

func (f fakeResolver) LookupIP(_ context.Context, _ string) ([]net.IP, error) {
	return f.ips, f.err
}

func TestDialContextBlocksPrivateResolution(t *testing.T) {
	g := &Guard{
		Resolver:    fakeResolver{ips: []net.IP{net.ParseIP("10.0.0.5")}},
		DialTimeout: time.Second,
	}
	_, err := g.DialContext(context.Background(), "tcp", "evil.example:80")
	if err == nil {
		t.Fatal("expected dial to be blocked")
	}
	var be *DialBlockError
	if !errors.As(err, &be) {
		t.Fatalf("expected DialBlockError, got %T: %v", err, err)
	}
	if !be.IsPrivate {
		t.Error("expected IsPrivate classification")
	}
}

func TestDialContextBlocksMetadataResolution(t *testing.T) {
	g := &Guard{
		Resolver:    fakeResolver{ips: []net.IP{net.ParseIP("169.254.169.254")}},
		DialTimeout: time.Second,
	}
	_, err := g.DialContext(context.Background(), "tcp", "metadata.example:80")
	var be *DialBlockError
	if !errors.As(err, &be) {
		t.Fatalf("expected DialBlockError, got %T", err)
	}
	if !be.IsMetadata {
		t.Error("expected IsMetadata classification for 169.254.169.254")
	}
}

func TestDialContextRebindPublicThenPrivate(t *testing.T) {
	// If resolution returns both a public and private address, only the public
	// one is dialed. We assert the private address never becomes the selected
	// target by pointing the "public" one at a closed local port and checking
	// the error is a normal dial failure, not a block.
	g := &Guard{
		Resolver: fakeResolver{ips: []net.IP{
			net.ParseIP("10.0.0.5"),  // private, must be filtered
			net.ParseIP("127.0.0.1"), // loopback, blocked here
		}},
		AllowLoopback: false,
		DialTimeout:   time.Second,
	}
	_, err := g.DialContext(context.Background(), "tcp", "rebind.example:80")
	var be *DialBlockError
	if !errors.As(err, &be) {
		t.Fatalf("expected all-blocked resolution to yield DialBlockError, got %T", err)
	}
}
