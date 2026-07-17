// Package tlscheck inspects a destination's TLS certificate. It performs a
// verifying handshake first; only when that fails does it perform a second
// non-verifying handshake purely to read the presented certificate for
// classification. No application data is ever exchanged over an unverified
// connection, and a check is never marked healthy on an invalid certificate.
package tlscheck

import (
	"context"
	"crypto/sha256"
	"crypto/tls"
	"encoding/hex"
	"errors"
	"net"
	"time"

	contracts "github.com/fajita-io/monitor-contracts"
)

// CertInfo is the safe, bounded summary of a certificate inspection.
type CertInfo struct {
	Subject           string    `json:"subject"`
	Issuer            string    `json:"issuer"`
	NotBefore         time.Time `json:"not_before"`
	NotAfter          time.Time `json:"not_after"`
	DaysRemaining     int       `json:"days_remaining"`
	HostnameMatch     bool      `json:"hostname_match"`
	ChainValid        bool      `json:"chain_valid"`
	TLSVersion        string    `json:"tls_version"`
	FingerprintSHA256 string    `json:"fingerprint_sha256"`
}

// Dialer connects to a validated address (the destination Guard).
type Dialer interface {
	DialContext(ctx context.Context, network, addr string) (net.Conn, error)
}

// Inspect performs the handshake(s) and returns cert info plus a failure
// category (empty when the certificate is valid). A nil CertInfo with a
// category indicates the handshake could not read a certificate at all.
func Inspect(ctx context.Context, d Dialer, host string, port int, timeout time.Duration) (*CertInfo, contracts.FailureCategory) {
	addr := net.JoinHostPort(host, itoa(port))

	// Verifying handshake.
	conn, cat := handshake(ctx, d, addr, host, timeout, false)
	if conn != nil {
		defer conn.Close()
		info := summarize(conn, host, true)
		conn.Close()
		return info, ""
	}
	if cat == contracts.FailConnectTimeout || cat == contracts.FailDNS || cat == contracts.FailBlockedDest || cat == contracts.FailConnRefused {
		return nil, cat
	}

	// Verification failed: read the presented cert without trusting it, purely
	// to classify. The result stays a failure.
	insecure, _ := handshake(ctx, d, addr, host, timeout, true)
	if insecure == nil {
		return nil, contracts.FailTLS
	}
	defer insecure.Close()
	info := summarize(insecure, host, false)
	return info, classify(info)
}

func handshake(ctx context.Context, d Dialer, addr, host string, timeout time.Duration, insecure bool) (*tls.Conn, contracts.FailureCategory) {
	raw, err := d.DialContext(ctx, "tcp", addr)
	if err != nil {
		return nil, dialCategory(err)
	}
	deadline := time.Now().Add(timeout)
	_ = raw.SetDeadline(deadline)
	tc := tls.Client(raw, &tls.Config{
		ServerName:         host,
		MinVersion:         tls.VersionTLS12,
		InsecureSkipVerify: insecure,
	})
	if err := tc.HandshakeContext(ctx); err != nil {
		_ = raw.Close()
		if isTimeout(err) {
			return nil, contracts.FailConnectTimeout
		}
		return nil, contracts.FailTLS
	}
	_ = tc.SetDeadline(time.Time{})
	return tc, ""
}

func summarize(tc *tls.Conn, host string, chainValid bool) *CertInfo {
	st := tc.ConnectionState()
	info := &CertInfo{ChainValid: chainValid, TLSVersion: tlsVersionName(st.Version)}
	if len(st.PeerCertificates) == 0 {
		return info
	}
	leaf := st.PeerCertificates[0]
	info.Subject = truncate(leaf.Subject.CommonName, 200)
	info.Issuer = truncate(leaf.Issuer.CommonName, 200)
	info.NotBefore = leaf.NotBefore
	info.NotAfter = leaf.NotAfter
	info.DaysRemaining = int(time.Until(leaf.NotAfter).Hours() / 24)
	info.HostnameMatch = leaf.VerifyHostname(host) == nil
	sum := sha256.Sum256(leaf.Raw)
	info.FingerprintSHA256 = hex.EncodeToString(sum[:])
	return info
}

func classify(info *CertInfo) contracts.FailureCategory {
	if info == nil {
		return contracts.FailTLS
	}
	now := time.Now()
	if !info.NotAfter.IsZero() && now.After(info.NotAfter) {
		return contracts.FailTLSExpired
	}
	if !info.NotBefore.IsZero() && now.Before(info.NotBefore) {
		return contracts.FailTLS // not yet valid
	}
	if !info.HostnameMatch {
		return contracts.FailTLSHostname
	}
	return contracts.FailTLS // untrusted chain / other
}

func dialCategory(err error) contracts.FailureCategory {
	if isTimeout(err) {
		return contracts.FailConnectTimeout
	}
	return contracts.FailConnRefused
}

func isTimeout(err error) bool {
	var ne net.Error
	if errors.As(err, &ne) {
		return ne.Timeout()
	}
	return false
}

func tlsVersionName(v uint16) string {
	switch v {
	case tls.VersionTLS13:
		return "1.3"
	case tls.VersionTLS12:
		return "1.2"
	case tls.VersionTLS11:
		return "1.1"
	case tls.VersionTLS10:
		return "1.0"
	default:
		return "unknown"
	}
}

func truncate(s string, n int) string {
	if len(s) > n {
		return s[:n]
	}
	return s
}

func itoa(n int) string {
	// small positive port
	if n == 0 {
		return "0"
	}
	buf := [6]byte{}
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	return string(buf[i:])
}
