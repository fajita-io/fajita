package executor

import (
	"context"
	"fmt"
	"time"

	contracts "github.com/fajita-io/monitor-contracts"
	"github.com/fajita-io/monitor-worker/internal/assertions"
	"github.com/fajita-io/monitor-worker/internal/destination"
	"github.com/fajita-io/monitor-worker/internal/httpcheck"
	"github.com/fajita-io/monitor-worker/internal/tlscheck"
)

// Secret is a decrypted request credential ready to apply as a header.
type Secret struct {
	Type       contracts.SecretType
	HeaderName string
	Value      string
}

// Request is one check to execute.
type Request struct {
	IdempotencyKey string
	MonitorID      string
	VersionID      string
	OrganizationID string
	ScheduledFor   time.Time
	Config         contracts.MonitorConfigSnapshot
	Secrets        []Secret
	IsTest         bool
	CorrelationID  string
}

// SecurityEvent is an optional protection event produced during execution.
type SecurityEvent struct {
	Type     contracts.SecurityEventType
	Severity string
	Summary  string
}

// Result is the normalized outcome of one check execution.
type Result struct {
	Status            contracts.ResultStatus
	FailureCategory   contracts.FailureCategory
	HTTPStatus        int
	FinalURL          string
	RedirectCount     int
	ResponseBytes     int64
	Timings           httpcheck.Timings
	Cert              *tlscheck.CertInfo
	DiagnosticSnippet string
	SafeErrorMessage  string
	Assertions        []assertions.Outcome
	AttemptCount      int
	SecurityEvent     *SecurityEvent
	StartedAt         time.Time
	CompletedAt       time.Time
}

// Executor runs checks. It is safe for concurrent use.
type Executor struct {
	UserAgent     string
	AllowLoopback bool  // test mode only
	AllowedPorts  []int // overrides the default 80/443 allowlist (test/lab only)
	Resolver      destination.Resolver
}

func (e *Executor) policy() destination.Policy {
	return destination.Policy{AllowedPorts: e.AllowedPorts}
}

// Execute runs a single check with bounded retries and panic recovery. One bad
// check can never crash the worker.
func (e *Executor) Execute(ctx context.Context, req Request) (res Result) {
	res.StartedAt = time.Now()
	defer func() {
		res.CompletedAt = time.Now()
		if r := recover(); r != nil {
			res = Result{
				Status:           contracts.StatusError,
				FailureCategory:  contracts.FailWorkerError,
				SafeErrorMessage: "An internal worker error occurred.",
				StartedAt:        res.StartedAt,
				CompletedAt:      time.Now(),
			}
		}
	}()

	attempts := req.Config.RetryCount + 1
	if attempts < 1 {
		attempts = 1
	}
	delay := time.Duration(req.Config.RetryDelayMS) * time.Millisecond

	var last Result
	for attempt := 1; attempt <= attempts; attempt++ {
		last = e.runOnce(ctx, req)
		last.AttemptCount = attempt
		if last.Status == contracts.StatusSuccess || !retryable(last.FailureCategory) {
			return last
		}
		if attempt < attempts {
			select {
			case <-ctx.Done():
				last.Status = contracts.StatusCanceled
				last.FailureCategory = contracts.FailCanceled
				return last
			case <-time.After(delay):
			}
		}
	}
	return last
}

func (e *Executor) runOnce(ctx context.Context, req Request) Result {
	guard := &destination.Guard{
		AllowLoopback: e.AllowLoopback,
		Resolver:      e.Resolver,
		DialTimeout:   time.Duration(req.Config.TimeoutMS) * time.Millisecond,
	}

	if req.Config.MonitorType == contracts.MonitorSSL {
		return e.runTLS(ctx, req, guard)
	}
	return e.runHTTP(ctx, req, guard)
}

func (e *Executor) runHTTP(ctx context.Context, req Request, guard *destination.Guard) Result {
	target, verr := e.policy().ValidateURL(req.Config.TargetURL)
	if verr != nil {
		return blockedResult(verr, req.Config.TargetURL)
	}

	headers := map[string]string{}
	for _, s := range req.Secrets {
		name := s.HeaderName
		if name == "" {
			name = "Authorization"
		}
		headers[name] = s.Value
	}

	method := string(req.Config.HTTPMethod)
	if method == "" {
		method = "GET"
	}

	hr := httpcheck.Do(ctx, httpcheck.Options{
		Guard:           guard,
		Policy:          e.policy(),
		TimeoutMS:       req.Config.TimeoutMS,
		FollowRedirects: req.Config.FollowRedirects,
		MaxRedirects:    req.Config.MaxRedirects,
		BodyLimitBytes:  req.Config.BodySizeLimitBytes,
		UserAgent:       e.userAgent(),
	}, method, target.Normalized, headers, nil)

	res := Result{
		HTTPStatus:    hr.StatusCode,
		FinalURL:      hr.FinalURL,
		RedirectCount: hr.RedirectCount,
		ResponseBytes: hr.ResponseBytes,
		Timings:       hr.Timings,
	}

	// Transport-level failure (never reached the assertion stage cleanly).
	if hr.FailureCategory != "" && hr.StatusCode == 0 {
		res.FailureCategory = hr.FailureCategory
		res.Status = statusForCategory(hr.FailureCategory)
		res.SafeErrorMessage = safeMessage(hr.FailureCategory)
		if hr.BlockErr != nil {
			res.SecurityEvent = securityEventFor(hr.BlockErr)
		}
		return res
	}
	if hr.FailureCategory == contracts.FailResponseTooLarge {
		res.FailureCategory = contracts.FailResponseTooLarge
		res.Status = contracts.StatusFailure
		res.SafeErrorMessage = safeMessage(contracts.FailResponseTooLarge)
		return res
	}

	// Assertion stage.
	ec := &assertions.EvalContext{
		StatusCode: hr.StatusCode,
		Header:     hr.Header,
		Body:       hr.Body,
		TotalMS:    hr.Timings.TotalMS,
	}
	specs := effectiveAssertions(req.Config)
	res.Assertions = make([]assertions.Outcome, 0, len(specs))
	failedCat := contracts.FailureCategory("")
	for _, spec := range specs {
		oc := assertions.Evaluate(spec, ec)
		res.Assertions = append(res.Assertions, oc)
		if !oc.Passed && failedCat == "" {
			if spec.AssertionType == contracts.AssertStatusCodeIn {
				failedCat = contracts.FailUnexpectedStatus
			} else {
				failedCat = contracts.FailAssertion
			}
		}
	}

	if failedCat != "" {
		res.FailureCategory = failedCat
		res.Status = contracts.StatusFailure
		res.SafeErrorMessage = safeMessage(failedCat)
		if failedCat == contracts.FailUnexpectedStatus {
			res.DiagnosticSnippet = fmt.Sprintf("status=%d", hr.StatusCode)
		}
		return res
	}

	res.Status = contracts.StatusSuccess
	return res
}

func (e *Executor) runTLS(ctx context.Context, req Request, guard *destination.Guard) Result {
	target, verr := e.policy().ValidateURL(req.Config.TargetURL)
	if verr != nil {
		return blockedResult(verr, req.Config.TargetURL)
	}
	timeout := time.Duration(req.Config.TimeoutMS) * time.Millisecond
	if timeout <= 0 {
		timeout = 10 * time.Second
	}
	cert, cat := tlscheck.Inspect(ctx, guard, target.Host, target.Port, timeout)

	res := Result{Cert: cert}
	if cat != "" {
		res.FailureCategory = cat
		res.Status = statusForCategory(cat)
		res.SafeErrorMessage = safeMessage(cat)
		return res
	}

	ec := &assertions.EvalContext{Cert: cert}
	specs := req.Config.Assertions
	if len(specs) == 0 {
		// Default SSL assertion: certificate must be valid.
		specs = []contracts.MonitorAssertionSpec{{AssertionType: contracts.AssertTLSValid}}
	}
	failed := contracts.FailureCategory("")
	for _, spec := range specs {
		oc := assertions.Evaluate(spec, ec)
		res.Assertions = append(res.Assertions, oc)
		if !oc.Passed && failed == "" {
			failed = contracts.FailAssertion
		}
	}
	if failed != "" {
		res.FailureCategory = failed
		res.Status = contracts.StatusFailure
		res.SafeErrorMessage = safeMessage(failed)
		return res
	}
	res.Status = contracts.StatusSuccess
	return res
}

// effectiveAssertions returns the configured assertions plus a synthesized
// status_code_in assertion when expected status codes are set and none exists.
func effectiveAssertions(cfg contracts.MonitorConfigSnapshot) []contracts.MonitorAssertionSpec {
	specs := append([]contracts.MonitorAssertionSpec{}, cfg.Assertions...)
	hasStatus := false
	for _, s := range specs {
		if s.AssertionType == contracts.AssertStatusCodeIn {
			hasStatus = true
		}
	}
	if !hasStatus && len(cfg.ExpectedStatusCodes) > 0 {
		specs = append([]contracts.MonitorAssertionSpec{{
			AssertionType:   contracts.AssertStatusCodeIn,
			ExpectedValue:   intsToCSV(cfg.ExpectedStatusCodes),
			ExpectedValueTy: contracts.ValueString,
		}}, specs...)
	}
	if cfg.ResponseTimeThresholdMS != nil {
		specs = append(specs, contracts.MonitorAssertionSpec{
			AssertionType:   contracts.AssertResponseTimeBelow,
			ExpectedValue:   itoa(*cfg.ResponseTimeThresholdMS),
			ExpectedValueTy: contracts.ValueNumber,
		})
	}
	return specs
}

func blockedResult(verr error, rawURL string) Result {
	ve, _ := verr.(*destination.ValidationError)
	cat := contracts.FailBlockedDest
	evtType := contracts.EvtSuspiciousDest
	if ve != nil {
		switch ve.Reason {
		case destination.ReasonUnsupportedScheme:
			cat = contracts.FailUnsupportedScheme
			evtType = contracts.EvtUnsupportedScheme
		case destination.ReasonBlockedPort:
			cat = contracts.FailBlockedDest
			evtType = contracts.EvtBlockedPort
		case destination.ReasonEmbeddedCreds:
			cat = contracts.FailBlockedDest
			evtType = contracts.EvtEmbeddedCredentials
		case destination.ReasonInvalidURL:
			cat = contracts.FailInvalidConfig
			evtType = contracts.EvtSuspiciousDest
		}
	}
	return Result{
		Status:           statusForCategory(cat),
		FailureCategory:  cat,
		SafeErrorMessage: safeMessage(cat),
		SecurityEvent: &SecurityEvent{
			Type:     evtType,
			Severity: "warning",
			Summary:  "Destination validation blocked a check.",
		},
	}
}

func securityEventFor(be *destination.DialBlockError) *SecurityEvent {
	evt := contracts.EvtBlockedPrivate
	summary := "A check resolved to a blocked address."
	if be.IsMetadata {
		evt = contracts.EvtBlockedMetadata
		summary = "A check attempted to reach a metadata endpoint."
	}
	return &SecurityEvent{Type: evt, Severity: "warning", Summary: summary}
}

func (e *Executor) userAgent() string {
	if e.UserAgent != "" {
		return e.UserAgent
	}
	return "Fajita-Monitor/1.0 (+https://fajita.io/monitoring)"
}

func intsToCSV(v []int) string {
	out := ""
	for i, n := range v {
		if i > 0 {
			out += ","
		}
		out += itoa(n)
	}
	return out
}

func itoa(n int) string {
	return fmt.Sprintf("%d", n)
}
