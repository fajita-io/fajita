// Package httpcheck builds Fajita's independently configured HTTP client and
// executes a single request with explicit timeouts, validated redirects,
// bounded response reads, and no automatic credential/cookie/proxy behavior.
// TLS verification is always on; an invalid certificate is reported, never
// silently trusted.
package httpcheck

import (
	"context"
	"crypto/tls"
	"errors"
	"io"
	"net"
	"net/http"
	"net/http/httptrace"
	"strings"
	"time"

	contracts "github.com/fajita-io/monitor-contracts"
	"github.com/fajita-io/monitor-worker/internal/destination"
)

var (
	errRedirectBlocked = errors.New("redirect target blocked")
	errRedirectLimit   = errors.New("redirect limit exceeded")
)

// Options configure a single execution.
type Options struct {
	Guard           *destination.Guard
	Policy          destination.Policy
	TimeoutMS       int
	FollowRedirects bool
	MaxRedirects    int
	BodyLimitBytes  int64
	UserAgent       string
}

// Timings are per-phase durations in milliseconds. Units are explicit and never
// mixed.
type Timings struct {
	DNSMS     int
	ConnectMS int
	TLSMS     int
	TTFBMS    int
	TotalMS   int
}

// Result is the outcome of one HTTP execution.
type Result struct {
	StatusCode      int
	Header          http.Header
	Body            []byte
	BodyTruncated   bool
	ResponseBytes   int64
	FinalURL        string
	RedirectCount   int
	Timings         Timings
	FailureCategory contracts.FailureCategory
	BlockErr        *destination.DialBlockError
	Err             error
}

// Do executes one request. Headers (including any secret-derived headers) are
// supplied by the caller and never logged here.
func Do(ctx context.Context, opt Options, method, rawURL string, headers map[string]string, body []byte) *Result {
	res := &Result{Header: http.Header{}}

	timeout := time.Duration(opt.TimeoutMS) * time.Millisecond
	if timeout <= 0 {
		timeout = 10 * time.Second
	}
	reqCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	transport := &http.Transport{
		Proxy:                 nil, // never inherit proxy from environment
		DialContext:           opt.Guard.DialContext,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          10,
		MaxIdleConnsPerHost:   2,
		MaxConnsPerHost:       4,
		IdleConnTimeout:       30 * time.Second,
		TLSHandshakeTimeout:   timeout,
		ExpectContinueTimeout: 1 * time.Second,
		ResponseHeaderTimeout: timeout,
		DisableCompression:    false,
	}
	defer transport.CloseIdleConnections()

	redirectCount := 0
	client := &http.Client{
		Transport: transport,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if !opt.FollowRedirects {
				return http.ErrUseLastResponse
			}
			redirectCount++
			if redirectCount > opt.MaxRedirects {
				return errRedirectLimit
			}
			// Every redirect target is revalidated with the same rules.
			if _, err := opt.Policy.ValidateURL(req.URL.String()); err != nil {
				return errRedirectBlocked
			}
			// Never forward Authorization or cookies to a different host.
			if len(via) > 0 && req.URL.Host != via[len(via)-1].URL.Host {
				req.Header.Del("Authorization")
				req.Header.Del("Cookie")
			}
			return nil
		},
	}

	var reqBody io.Reader
	if len(body) > 0 {
		reqBody = strings.NewReader(string(body))
	}
	req, err := http.NewRequestWithContext(reqCtx, method, rawURL, reqBody)
	if err != nil {
		res.FailureCategory = contracts.FailInvalidConfig
		res.Err = err
		return res
	}
	req.Header.Set("User-Agent", opt.UserAgent)
	req.Header.Set("Accept-Encoding", "gzip")
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	// Timing trace. DNS is resolved inside the guarded dialer, so connect
	// timing includes resolution; TLS and TTFB are measured precisely.
	var connectStart, tlsStart, start time.Time
	start = time.Now()
	trace := &httptrace.ClientTrace{
		ConnectStart:         func(_, _ string) { connectStart = time.Now() },
		ConnectDone:          func(_, _ string, _ error) { res.Timings.ConnectMS = msSince(connectStart) },
		TLSHandshakeStart:    func() { tlsStart = time.Now() },
		TLSHandshakeDone:     func(_ tls.ConnectionState, _ error) { res.Timings.TLSMS = msSince(tlsStart) },
		GotFirstResponseByte: func() { res.Timings.TTFBMS = msSince(start) },
	}
	req = req.WithContext(httptrace.WithClientTrace(reqCtx, trace))

	resp, err := client.Do(req)
	res.Timings.TotalMS = msSince(start)
	res.RedirectCount = redirectCount
	if err != nil {
		classifyErr(res, err)
		return res
	}
	defer resp.Body.Close()

	res.StatusCode = resp.StatusCode
	res.Header = resp.Header
	res.FinalURL = resp.Request.URL.String()

	limit := opt.BodyLimitBytes
	if limit <= 0 {
		limit = 1 << 20
	}
	limited := io.LimitReader(resp.Body, limit+1)
	data, _ := io.ReadAll(limited)
	res.ResponseBytes = int64(len(data))
	if int64(len(data)) > limit {
		res.Body = data[:limit]
		res.BodyTruncated = true
		res.FailureCategory = contracts.FailResponseTooLarge
	} else {
		res.Body = data
	}
	return res
}

func classifyErr(res *Result, err error) {
	var blockErr *destination.DialBlockError
	if errors.As(err, &blockErr) {
		res.BlockErr = blockErr
		res.FailureCategory = contracts.FailBlockedDest
		res.Err = err
		return
	}
	if errors.Is(err, errRedirectBlocked) {
		res.FailureCategory = contracts.FailRedirectBlocked
		res.Err = err
		return
	}
	if errors.Is(err, errRedirectLimit) {
		res.FailureCategory = contracts.FailRedirectLimit
		res.Err = err
		return
	}
	if errors.Is(err, context.DeadlineExceeded) {
		res.FailureCategory = contracts.FailResponseTimeout
		res.Err = err
		return
	}
	var dnsErr *net.DNSError
	if errors.As(err, &dnsErr) {
		res.FailureCategory = contracts.FailDNS
		res.Err = err
		return
	}
	msg := err.Error()
	switch {
	case strings.Contains(msg, "connection refused"):
		res.FailureCategory = contracts.FailConnRefused
	case strings.Contains(msg, "connection reset"):
		res.FailureCategory = contracts.FailConnReset
	case strings.Contains(msg, "tls") || strings.Contains(msg, "certificate") || strings.Contains(msg, "x509"):
		res.FailureCategory = contracts.FailTLS
	case strings.Contains(msg, "timeout") || strings.Contains(msg, "deadline"):
		res.FailureCategory = contracts.FailResponseTimeout
	default:
		res.FailureCategory = contracts.FailConnRefused
	}
	res.Err = err
}

func msSince(t time.Time) int {
	if t.IsZero() {
		return 0
	}
	return int(time.Since(t).Milliseconds())
}
