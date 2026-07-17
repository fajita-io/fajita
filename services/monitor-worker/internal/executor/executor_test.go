package executor

import (
	"context"
	"net"
	"net/http/httptest"
	"net/url"
	"strconv"
	"testing"
	"time"

	contracts "github.com/fajita-io/monitor-contracts"
	"github.com/fajita-io/monitor-worker/internal/destination"
	"github.com/fajita-io/monitor-worker/internal/testfixture"
)

// staticResolver simulates DNS returning a fixed address set.
type staticResolver struct{ ips []net.IP }

func (s staticResolver) LookupIP(_ context.Context, _ string) ([]net.IP, error) {
	return s.ips, nil
}

func fixtureExecutor(t *testing.T) (*Executor, *httptest.Server, int) {
	t.Helper()
	srv := httptest.NewServer(testfixture.Handler())
	t.Cleanup(srv.Close)
	u, _ := url.Parse(srv.URL)
	port, _ := strconv.Atoi(u.Port())
	e := &Executor{
		AllowLoopback: true,
		AllowedPorts:  []int{80, 443, port},
	}
	return e, srv, port
}

func cfg(url string, t contracts.MonitorType) contracts.MonitorConfigSnapshot {
	return contracts.MonitorConfigSnapshot{
		MonitorType:        t,
		TargetURL:          url,
		HTTPMethod:         contracts.MethodGET,
		TimeoutMS:          2000,
		BodySizeLimitBytes: 1 << 20,
	}
}

func TestExecuteSuccess(t *testing.T) {
	e, srv, _ := fixtureExecutor(t)
	c := cfg(srv.URL+"/ok", contracts.MonitorHTTP)
	c.ExpectedStatusCodes = []int{200}
	res := e.Execute(context.Background(), Request{Config: c})
	if res.Status != contracts.StatusSuccess {
		t.Fatalf("expected success, got %s (%s)", res.Status, res.FailureCategory)
	}
	if res.HTTPStatus != 200 {
		t.Errorf("expected 200, got %d", res.HTTPStatus)
	}
}

func TestExecuteUnexpectedStatus(t *testing.T) {
	e, srv, _ := fixtureExecutor(t)
	c := cfg(srv.URL+"/status/500", contracts.MonitorHTTP)
	c.ExpectedStatusCodes = []int{200}
	res := e.Execute(context.Background(), Request{Config: c})
	if res.Status != contracts.StatusFailure {
		t.Fatalf("expected failure, got %s", res.Status)
	}
	if res.FailureCategory != contracts.FailUnexpectedStatus {
		t.Errorf("expected unexpected_status, got %s", res.FailureCategory)
	}
}

func TestExecuteTimeout(t *testing.T) {
	e, srv, _ := fixtureExecutor(t)
	c := cfg(srv.URL+"/delay/1500", contracts.MonitorHTTP)
	c.TimeoutMS = 300
	res := e.Execute(context.Background(), Request{Config: c})
	if res.Status != contracts.StatusTimedOut {
		t.Fatalf("expected timed_out, got %s (%s)", res.Status, res.FailureCategory)
	}
}

func TestExecuteRedirectLoop(t *testing.T) {
	e, srv, _ := fixtureExecutor(t)
	c := cfg(srv.URL+"/redirect/loop", contracts.MonitorHTTP)
	c.FollowRedirects = true
	c.MaxRedirects = 5
	res := e.Execute(context.Background(), Request{Config: c})
	if res.FailureCategory != contracts.FailRedirectLimit {
		t.Fatalf("expected redirect_limit, got %s (%s)", res.FailureCategory, res.Status)
	}
}

func TestExecuteRedirectFollowed(t *testing.T) {
	e, srv, _ := fixtureExecutor(t)
	c := cfg(srv.URL+"/redirect/one", contracts.MonitorHTTP)
	c.FollowRedirects = true
	c.MaxRedirects = 5
	c.ExpectedStatusCodes = []int{200}
	res := e.Execute(context.Background(), Request{Config: c})
	if res.Status != contracts.StatusSuccess {
		t.Fatalf("expected success after redirect, got %s (%s)", res.Status, res.FailureCategory)
	}
	if res.RedirectCount != 1 {
		t.Errorf("expected 1 redirect, got %d", res.RedirectCount)
	}
}

func TestExecuteLargeResponse(t *testing.T) {
	e, srv, _ := fixtureExecutor(t)
	c := cfg(srv.URL+"/large-response", contracts.MonitorHTTP)
	c.BodySizeLimitBytes = 1 << 20
	res := e.Execute(context.Background(), Request{Config: c})
	if res.FailureCategory != contracts.FailResponseTooLarge {
		t.Fatalf("expected response_too_large, got %s", res.FailureCategory)
	}
}

func TestExecuteKeywordAssertion(t *testing.T) {
	e, srv, _ := fixtureExecutor(t)
	c := cfg(srv.URL+"/body/contains", contracts.MonitorHTTP)
	c.ExpectedStatusCodes = []int{200}
	c.Assertions = []contracts.MonitorAssertionSpec{
		{AssertionType: contracts.AssertBodyContains, ExpectedValue: "nominal"},
	}
	res := e.Execute(context.Background(), Request{Config: c})
	if res.Status != contracts.StatusSuccess {
		t.Fatalf("expected success, got %s", res.Status)
	}

	c.Assertions = []contracts.MonitorAssertionSpec{
		{AssertionType: contracts.AssertBodyContains, ExpectedValue: "catastrophe"},
	}
	res = e.Execute(context.Background(), Request{Config: c})
	if res.Status != contracts.StatusFailure || res.FailureCategory != contracts.FailAssertion {
		t.Fatalf("expected assertion failure, got %s (%s)", res.Status, res.FailureCategory)
	}
}

func TestExecuteJSONAssertion(t *testing.T) {
	e, srv, _ := fixtureExecutor(t)
	c := cfg(srv.URL+"/json/healthy", contracts.MonitorAPI)
	c.ExpectedStatusCodes = []int{200}
	c.Assertions = []contracts.MonitorAssertionSpec{
		{AssertionType: contracts.AssertJSONPathEquals, FieldPath: "status", ExpectedValue: "healthy"},
		{AssertionType: contracts.AssertJSONNumberGT, FieldPath: "uptime", ExpectedValue: "99"},
	}
	res := e.Execute(context.Background(), Request{Config: c})
	if res.Status != contracts.StatusSuccess {
		t.Fatalf("expected success, got %s (%s)", res.Status, res.FailureCategory)
	}
	if len(res.Assertions) < 2 {
		t.Errorf("expected assertion outcomes recorded, got %d", len(res.Assertions))
	}
}

func TestExecuteResponseTimeAssertionFast500(t *testing.T) {
	// A fast 500 must never be healthy even if response time passes.
	e, srv, _ := fixtureExecutor(t)
	c := cfg(srv.URL+"/status/500", contracts.MonitorHTTP)
	c.ExpectedStatusCodes = []int{200}
	threshold := 5000
	c.ResponseTimeThresholdMS = &threshold
	res := e.Execute(context.Background(), Request{Config: c})
	if res.Status == contracts.StatusSuccess {
		t.Fatal("a fast 500 must not be reported healthy")
	}
}

func TestExecuteBlockedDestination(t *testing.T) {
	e := &Executor{
		Resolver: staticResolver{ips: []net.IP{net.ParseIP("10.0.0.5")}},
	}
	c := cfg("http://internal.blocked.test/ok", contracts.MonitorHTTP)
	res := e.Execute(context.Background(), Request{Config: c})
	if res.Status != contracts.StatusBlocked {
		t.Fatalf("expected blocked, got %s (%s)", res.Status, res.FailureCategory)
	}
	if res.SecurityEvent == nil {
		t.Error("expected a security event for a blocked destination")
	}
}

func TestExecuteMetadataBlocked(t *testing.T) {
	e := &Executor{
		Resolver: staticResolver{ips: []net.IP{net.ParseIP("169.254.169.254")}},
	}
	c := cfg("http://metadata.test/latest", contracts.MonitorHTTP)
	res := e.Execute(context.Background(), Request{Config: c})
	if res.Status != contracts.StatusBlocked {
		t.Fatalf("expected blocked, got %s", res.Status)
	}
	if res.SecurityEvent == nil || res.SecurityEvent.Type != contracts.EvtBlockedMetadata {
		t.Errorf("expected metadata security event, got %+v", res.SecurityEvent)
	}
}

func TestExecuteUnsupportedScheme(t *testing.T) {
	e := &Executor{}
	c := cfg("ftp://example.com/", contracts.MonitorHTTP)
	res := e.Execute(context.Background(), Request{Config: c})
	if res.FailureCategory != contracts.FailUnsupportedScheme {
		t.Fatalf("expected unsupported_scheme, got %s", res.FailureCategory)
	}
}

func TestExecutePanicRecovery(t *testing.T) {
	// A nil-ish config should never panic the worker; it returns a classified
	// result instead.
	e := &Executor{}
	res := e.Execute(context.Background(), Request{Config: contracts.MonitorConfigSnapshot{
		MonitorType: contracts.MonitorHTTP,
		TargetURL:   "http://example.com:22/", // blocked port
	}})
	if res.Status == contracts.StatusSuccess {
		t.Error("blocked port must not succeed")
	}
}

func TestExecuteTLSInspection(t *testing.T) {
	srv := httptest.NewTLSServer(testfixture.Handler())
	t.Cleanup(srv.Close)
	u, _ := url.Parse(srv.URL)
	port, _ := strconv.Atoi(u.Port())
	e := &Executor{
		AllowLoopback: true,
		AllowedPorts:  []int{80, 443, port},
	}
	c := cfg(srv.URL+"/ok", contracts.MonitorSSL)
	c.TimeoutMS = 3000
	res := e.Execute(context.Background(), Request{Config: c})
	// httptest uses a self-signed cert: chain is untrusted, so tls_valid fails.
	if res.Status == contracts.StatusSuccess {
		t.Error("self-signed cert must not pass default tls_valid assertion")
	}
	if res.Cert == nil {
		t.Fatal("expected certificate details to be captured even on failure")
	}
	if res.Cert.FingerprintSHA256 == "" {
		t.Error("expected a certificate fingerprint")
	}
}

func TestExecuteRetriesTransientFailure(t *testing.T) {
	// A response timeout is transient and retryable. Verify the executor makes
	// the configured number of attempts.
	e, srv, _ := fixtureExecutor(t)
	c := cfg(srv.URL+"/delay/1000", contracts.MonitorHTTP)
	c.RetryCount = 1
	c.RetryDelayMS = 10
	c.TimeoutMS = 150
	res := e.Execute(context.Background(), Request{Config: c})
	if res.Status != contracts.StatusTimedOut {
		t.Fatalf("expected timed_out, got %s", res.Status)
	}
	if res.AttemptCount != 2 {
		t.Errorf("expected 2 attempts for retryable failure, got %d", res.AttemptCount)
	}
}

func TestExecuteDoesNotRetryBlocked(t *testing.T) {
	// Blocked destinations must never be retried.
	e := &Executor{Resolver: staticResolver{ips: []net.IP{net.ParseIP("10.0.0.5")}}}
	c := cfg("http://internal.blocked.test/", contracts.MonitorHTTP)
	c.RetryCount = 3
	c.RetryDelayMS = 10
	res := e.Execute(context.Background(), Request{Config: c})
	if res.AttemptCount != 1 {
		t.Errorf("blocked destination must not retry, got %d attempts", res.AttemptCount)
	}
}

var _ = destination.Policy{}
var _ = time.Second
