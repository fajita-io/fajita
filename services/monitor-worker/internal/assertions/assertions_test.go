package assertions

import (
	"net/http"
	"testing"
	"time"

	contracts "github.com/fajita-io/monitor-contracts"
	"github.com/fajita-io/monitor-worker/internal/tlscheck"
)

func spec(t contracts.AssertionType, field, expected string) contracts.MonitorAssertionSpec {
	return contracts.MonitorAssertionSpec{AssertionType: t, FieldPath: field, ExpectedValue: expected}
}

func TestStatusCodeIn(t *testing.T) {
	ec := &EvalContext{StatusCode: 200}
	if !Evaluate(spec(contracts.AssertStatusCodeIn, "", "200,201,204"), ec).Passed {
		t.Error("200 should be in the set")
	}
	ec.StatusCode = 500
	if Evaluate(spec(contracts.AssertStatusCodeIn, "", "200,201,204"), ec).Passed {
		t.Error("500 should not be in the set")
	}
}

func TestResponseTimeBelow(t *testing.T) {
	ec := &EvalContext{TotalMS: 120}
	if !Evaluate(spec(contracts.AssertResponseTimeBelow, "", "500"), ec).Passed {
		t.Error("120ms < 500ms should pass")
	}
	ec.TotalMS = 900
	if Evaluate(spec(contracts.AssertResponseTimeBelow, "", "500"), ec).Passed {
		t.Error("900ms should fail 500ms threshold")
	}
}

func TestBodyContains(t *testing.T) {
	ec := &EvalContext{Body: []byte("all systems nominal")}
	if !Evaluate(spec(contracts.AssertBodyContains, "", "nominal"), ec).Passed {
		t.Error("expected keyword found")
	}
	if Evaluate(spec(contracts.AssertBodyContains, "", "degraded"), ec).Passed {
		t.Error("expected keyword missing to fail")
	}
	// Not-contains inverts.
	if !Evaluate(spec(contracts.AssertBodyNotContains, "", "degraded"), ec).Passed {
		t.Error("expected forbidden keyword absent to pass")
	}
	if Evaluate(spec(contracts.AssertBodyNotContains, "", "nominal"), ec).Passed {
		t.Error("expected forbidden keyword present to fail")
	}
}

func TestBodyContainsCaseSensitivity(t *testing.T) {
	ec := &EvalContext{Body: []byte("Healthy")}
	insensitive := spec(contracts.AssertBodyContains, "", "healthy")
	if !Evaluate(insensitive, ec).Passed {
		t.Error("case-insensitive match should pass")
	}
	sensitive := insensitive
	sensitive.CaseSensitive = true
	if Evaluate(sensitive, ec).Passed {
		t.Error("case-sensitive match should fail on case difference")
	}
}

func TestHeaderEquals(t *testing.T) {
	h := http.Header{}
	h.Set("Cache-Control", "no-store")
	ec := &EvalContext{Header: h}
	if !Evaluate(spec(contracts.AssertHeaderEquals, "Cache-Control", "no-store"), ec).Passed {
		t.Error("header should match")
	}
	if Evaluate(spec(contracts.AssertHeaderEquals, "Cache-Control", "public"), ec).Passed {
		t.Error("header mismatch should fail")
	}
}

func TestJSONAssertions(t *testing.T) {
	body := []byte(`{"status":"healthy","uptime":99.98,"queue":3,"ready":true,"items":[{"name":"a"},{"name":"b"}]}`)
	ec := &EvalContext{Body: body}

	pass := []contracts.MonitorAssertionSpec{
		spec(contracts.AssertJSONPathExists, "status", ""),
		spec(contracts.AssertJSONPathNotExists, "missing", ""),
		spec(contracts.AssertJSONPathEquals, "status", "healthy"),
		spec(contracts.AssertJSONPathNotEquals, "status", "degraded"),
		spec(contracts.AssertJSONBoolTrue, "ready", ""),
		{AssertionType: contracts.AssertJSONPathEquals, FieldPath: "items[1].name", ExpectedValue: "b"},
	}
	for _, s := range pass {
		// reset json cache per spec by using fresh context body decode
		ecx := &EvalContext{Body: body}
		if !Evaluate(s, ecx).Passed {
			t.Errorf("expected pass for %s %s", s.AssertionType, s.FieldPath)
		}
	}

	// Numeric comparisons.
	gt := spec(contracts.AssertJSONNumberGT, "uptime", "99")
	if !Evaluate(gt, &EvalContext{Body: body}).Passed {
		t.Error("uptime 99.98 > 99 should pass")
	}
	lt := spec(contracts.AssertJSONNumberLT, "queue", "10")
	if !Evaluate(lt, &EvalContext{Body: body}).Passed {
		t.Error("queue 3 < 10 should pass")
	}
	gtFail := spec(contracts.AssertJSONNumberGT, "queue", "100")
	if Evaluate(gtFail, &EvalContext{Body: body}).Passed {
		t.Error("queue 3 > 100 should fail")
	}
	_ = ec
}

func TestJSONInvalid(t *testing.T) {
	ec := &EvalContext{Body: []byte(`{"status": "healthy", oops`)}
	out := Evaluate(spec(contracts.AssertJSONPathExists, "status", ""), ec)
	if out.Passed {
		t.Error("invalid JSON should fail json assertions")
	}
}

func TestJSONTypeMismatchAndMissing(t *testing.T) {
	body := []byte(`{"n":5,"s":"text"}`)
	// numeric comparison against a string value
	out := Evaluate(spec(contracts.AssertJSONNumberGT, "s", "1"), &EvalContext{Body: body})
	if out.Passed {
		t.Error("numeric comparison on string must fail")
	}
	// missing path
	out = Evaluate(spec(contracts.AssertJSONPathEquals, "nope", "x"), &EvalContext{Body: body})
	if out.Passed {
		t.Error("missing path equals must fail")
	}
}

func TestTLSAssertions(t *testing.T) {
	valid := &tlscheck.CertInfo{ChainValid: true, DaysRemaining: 40, HostnameMatch: true, NotAfter: time.Now().Add(40 * 24 * time.Hour)}
	if !Evaluate(spec(contracts.AssertTLSValid, "", ""), &EvalContext{Cert: valid}).Passed {
		t.Error("valid cert should pass tls_valid")
	}
	if !Evaluate(spec(contracts.AssertTLSHostnameMatch, "", ""), &EvalContext{Cert: valid}).Passed {
		t.Error("matching hostname should pass")
	}
	if !Evaluate(spec(contracts.AssertTLSExpiresAfter, "", "30"), &EvalContext{Cert: valid}).Passed {
		t.Error("40 days >= 30 should pass")
	}
	if Evaluate(spec(contracts.AssertTLSExpiresAfter, "", "60"), &EvalContext{Cert: valid}).Passed {
		t.Error("40 days >= 60 should fail")
	}
	invalid := &tlscheck.CertInfo{ChainValid: false, DaysRemaining: -1, HostnameMatch: false}
	if Evaluate(spec(contracts.AssertTLSValid, "", ""), &EvalContext{Cert: invalid}).Passed {
		t.Error("invalid cert should fail tls_valid")
	}
}

func TestHeartbeatAssertion(t *testing.T) {
	yes := true
	no := false
	if !Evaluate(spec(contracts.AssertHeartbeatInGrace, "", ""), &EvalContext{HeartbeatWithinGrace: &yes}).Passed {
		t.Error("within grace should pass")
	}
	if Evaluate(spec(contracts.AssertHeartbeatInGrace, "", ""), &EvalContext{HeartbeatWithinGrace: &no}).Passed {
		t.Error("outside grace should fail")
	}
}

func TestSummariesAreBounded(t *testing.T) {
	long := make([]byte, 5000)
	for i := range long {
		long[i] = 'x'
	}
	ec := &EvalContext{Body: long}
	out := Evaluate(spec(contracts.AssertBodyContains, "", "y"), ec)
	if len(out.ExpectedSummary) > maxSummaryLen || len(out.ActualSummary) > maxSummaryLen {
		t.Error("summaries must be bounded")
	}
}

func TestParsePathRejectsUnbounded(t *testing.T) {
	deep := ""
	for i := 0; i < 100; i++ {
		deep += "a."
	}
	if parsePath(deep+"b") != nil {
		t.Error("expected overly deep path to be rejected")
	}
}
