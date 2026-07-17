// Package assertions evaluates Fajita's typed, non-programmable assertions
// against a check response. There is no expression language, no eval, and no
// regular expressions. Summaries are bounded and never contain secrets or full
// response bodies.
package assertions

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	contracts "github.com/fajita-io/monitor-contracts"
	"github.com/fajita-io/monitor-worker/internal/tlscheck"
)

const maxSummaryLen = 120

// EvalContext is everything an assertion may read about a response.
type EvalContext struct {
	StatusCode           int
	Header               http.Header
	Body                 []byte
	BodyTruncated        bool
	TotalMS              int
	Cert                 *tlscheck.CertInfo
	HeartbeatWithinGrace *bool

	// jsonOnce caches a single decode of the body for all JSON assertions.
	jsonDecoded bool
	jsonValue   any
	jsonValid   bool
}

// Outcome is one assertion's result, safe to persist.
type Outcome struct {
	AssertionID     string
	Type            contracts.AssertionType
	Passed          bool
	ExpectedSummary string
	ActualSummary   string
	FailureReason   string
	Position        int
}

// Evaluate runs one assertion. It never panics on malformed input; it returns a
// failed outcome with a safe reason instead.
func Evaluate(spec contracts.MonitorAssertionSpec, ec *EvalContext) Outcome {
	out := Outcome{AssertionID: spec.ID, Type: spec.AssertionType, Position: spec.Position}
	switch spec.AssertionType {
	case contracts.AssertStatusCodeIn:
		return evalStatusIn(spec, ec, out)
	case contracts.AssertResponseTimeBelow:
		return evalResponseTime(spec, ec, out)
	case contracts.AssertBodyContains:
		return evalBodyContains(spec, ec, out, true)
	case contracts.AssertBodyNotContains:
		return evalBodyContains(spec, ec, out, false)
	case contracts.AssertHeaderEquals:
		return evalHeaderEquals(spec, ec, out)
	case contracts.AssertTLSValid:
		return evalTLSValid(ec, out)
	case contracts.AssertTLSHostnameMatch:
		return evalTLSHostname(ec, out)
	case contracts.AssertTLSExpiresAfter:
		return evalTLSExpiresAfter(spec, ec, out)
	case contracts.AssertHeartbeatInGrace:
		return evalHeartbeat(ec, out)
	default:
		return evalJSON(spec, ec, out)
	}
}

func pass(o Outcome, expected, actual string) Outcome {
	o.Passed = true
	o.ExpectedSummary = trunc(expected)
	o.ActualSummary = trunc(actual)
	return o
}

func fail(o Outcome, expected, actual, reason string) Outcome {
	o.Passed = false
	o.ExpectedSummary = trunc(expected)
	o.ActualSummary = trunc(actual)
	o.FailureReason = trunc(reason)
	return o
}

func evalStatusIn(spec contracts.MonitorAssertionSpec, ec *EvalContext, o Outcome) Outcome {
	codes := parseIntList(spec.ExpectedValue)
	for _, c := range codes {
		if c == ec.StatusCode {
			return pass(o, "status in "+spec.ExpectedValue, strconv.Itoa(ec.StatusCode))
		}
	}
	return fail(o, "status in "+spec.ExpectedValue, strconv.Itoa(ec.StatusCode), "unexpected status code")
}

func evalResponseTime(spec contracts.MonitorAssertionSpec, ec *EvalContext, o Outcome) Outcome {
	threshold, err := strconv.Atoi(strings.TrimSpace(spec.ExpectedValue))
	if err != nil {
		return fail(o, spec.ExpectedValue, "", "invalid threshold")
	}
	exp := fmt.Sprintf("< %dms", threshold)
	act := fmt.Sprintf("%dms", ec.TotalMS)
	if ec.TotalMS < threshold {
		return pass(o, exp, act)
	}
	return fail(o, exp, act, "response too slow")
}

func evalBodyContains(spec contracts.MonitorAssertionSpec, ec *EvalContext, o Outcome, wantPresent bool) Outcome {
	needle := spec.ExpectedValue
	hay := ec.Body
	var found bool
	if spec.CaseSensitive {
		found = bytes.Contains(hay, []byte(needle))
	} else {
		found = bytes.Contains(bytes.ToLower(hay), bytes.ToLower([]byte(needle)))
	}
	exp := "body contains keyword"
	if !wantPresent {
		exp = "body does not contain keyword"
	}
	actual := "absent"
	if found {
		actual = "present"
	}
	if found == wantPresent {
		return pass(o, exp, actual)
	}
	reason := "keyword not found"
	if !wantPresent {
		reason = "forbidden keyword present"
	}
	return fail(o, exp, actual, reason)
}

func evalHeaderEquals(spec contracts.MonitorAssertionSpec, ec *EvalContext, o Outcome) Outcome {
	name := spec.FieldPath
	got := ""
	if ec.Header != nil {
		got = ec.Header.Get(name)
	}
	match := false
	if spec.CaseSensitive {
		match = got == spec.ExpectedValue
	} else {
		match = strings.EqualFold(got, spec.ExpectedValue)
	}
	exp := name + " = " + spec.ExpectedValue
	if match {
		return pass(o, exp, got)
	}
	return fail(o, exp, got, "header value mismatch")
}

func evalTLSValid(ec *EvalContext, o Outcome) Outcome {
	if ec.Cert == nil {
		return fail(o, "valid TLS certificate", "none", "no certificate")
	}
	if ec.Cert.ChainValid && ec.Cert.DaysRemaining > 0 {
		return pass(o, "valid TLS certificate", "valid")
	}
	return fail(o, "valid TLS certificate", "invalid", "certificate invalid or expired")
}

func evalTLSHostname(ec *EvalContext, o Outcome) Outcome {
	if ec.Cert == nil {
		return fail(o, "hostname matches", "none", "no certificate")
	}
	if ec.Cert.HostnameMatch {
		return pass(o, "hostname matches", "match")
	}
	return fail(o, "hostname matches", "mismatch", "certificate hostname mismatch")
}

func evalTLSExpiresAfter(spec contracts.MonitorAssertionSpec, ec *EvalContext, o Outcome) Outcome {
	min, err := strconv.Atoi(strings.TrimSpace(spec.ExpectedValue))
	if err != nil {
		return fail(o, spec.ExpectedValue, "", "invalid day threshold")
	}
	if ec.Cert == nil {
		return fail(o, fmt.Sprintf(">= %d days", min), "none", "no certificate")
	}
	act := fmt.Sprintf("%d days", ec.Cert.DaysRemaining)
	if ec.Cert.DaysRemaining >= min {
		return pass(o, fmt.Sprintf(">= %d days", min), act)
	}
	return fail(o, fmt.Sprintf(">= %d days", min), act, "certificate expiring too soon")
}

func evalHeartbeat(ec *EvalContext, o Outcome) Outcome {
	if ec.HeartbeatWithinGrace != nil && *ec.HeartbeatWithinGrace {
		return pass(o, "heartbeat within grace", "received")
	}
	return fail(o, "heartbeat within grace", "missed", "heartbeat not received in grace period")
}

func trunc(s string) string {
	if len(s) > maxSummaryLen {
		return s[:maxSummaryLen]
	}
	return s
}

func parseIntList(s string) []int {
	var out []int
	for _, p := range strings.Split(s, ",") {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		if n, err := strconv.Atoi(p); err == nil {
			out = append(out, n)
		}
	}
	return out
}

// jsonRoot decodes the body once, bounding by the already-bounded body length.
func (ec *EvalContext) jsonRoot() (any, bool) {
	if !ec.jsonDecoded {
		ec.jsonDecoded = true
		var v any
		if err := json.Unmarshal(ec.Body, &v); err == nil {
			ec.jsonValue = v
			ec.jsonValid = true
		}
	}
	return ec.jsonValue, ec.jsonValid
}
