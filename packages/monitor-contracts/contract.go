// Package contracts is the canonical Go mirror of the Fajita monitoring engine
// contracts. It defines the vocabulary shared by the web application, the
// database, and the Go worker.
//
// Keep this file in lockstep with contract.ts in the same directory. Any
// breaking change to these values bumps ContractVersion. A worker whose
// ContractVersion does not match what it registers against fails readiness
// rather than risk corrupting data (see docs/engineering/worker-contracts.md).
package contracts

// ContractVersion is the shared contract version. Mirror of CONTRACT_VERSION in
// contract.ts.
const ContractVersion = 1

// Monitor types.
type MonitorType string

const (
	MonitorHTTP      MonitorType = "http"
	MonitorHTTPS     MonitorType = "https"
	MonitorAPI       MonitorType = "api"
	MonitorSSL       MonitorType = "ssl"
	MonitorHeartbeat MonitorType = "heartbeat"
)

// HTTP methods approved for checks.
type HTTPMethod string

const (
	MethodGET  HTTPMethod = "GET"
	MethodHEAD HTTPMethod = "HEAD"
	MethodPOST HTTPMethod = "POST"
)

// ApprovedIntervalsSeconds are the only allowed check intervals.
var ApprovedIntervalsSeconds = []int{60, 300, 600, 900, 1800, 3600}

// Assertion types.
type AssertionType string

const (
	AssertStatusCodeIn      AssertionType = "status_code_in"
	AssertResponseTimeBelow AssertionType = "response_time_below"
	AssertBodyContains      AssertionType = "body_contains"
	AssertBodyNotContains   AssertionType = "body_not_contains"
	AssertHeaderEquals      AssertionType = "header_equals"
	AssertJSONPathExists    AssertionType = "json_path_exists"
	AssertJSONPathNotExists AssertionType = "json_path_not_exists"
	AssertJSONPathEquals    AssertionType = "json_path_equals"
	AssertJSONPathNotEquals AssertionType = "json_path_not_equals"
	AssertJSONNumberGT      AssertionType = "json_number_gt"
	AssertJSONNumberGTE     AssertionType = "json_number_gte"
	AssertJSONNumberLT      AssertionType = "json_number_lt"
	AssertJSONNumberLTE     AssertionType = "json_number_lte"
	AssertJSONContainsStr   AssertionType = "json_contains_string"
	AssertJSONBoolTrue      AssertionType = "json_boolean_true"
	AssertJSONBoolFalse     AssertionType = "json_boolean_false"
	AssertTLSValid          AssertionType = "tls_valid"
	AssertTLSHostnameMatch  AssertionType = "tls_hostname_matches"
	AssertTLSExpiresAfter   AssertionType = "tls_expires_after_days"
	AssertHeartbeatInGrace  AssertionType = "heartbeat_within_grace"
)

// ExpectedValueType classifies an assertion's expected value.
type ExpectedValueType string

const (
	ValueString   ExpectedValueType = "string"
	ValueNumber   ExpectedValueType = "number"
	ValueBoolean  ExpectedValueType = "boolean"
	ValueDuration ExpectedValueType = "duration"
	ValueNone     ExpectedValueType = "none"
)

// ResultStatus is the overall outcome of a check.
type ResultStatus string

const (
	StatusSuccess  ResultStatus = "success"
	StatusFailure  ResultStatus = "failure"
	StatusError    ResultStatus = "error"
	StatusTimedOut ResultStatus = "timed_out"
	StatusBlocked  ResultStatus = "blocked"
	StatusCanceled ResultStatus = "canceled"
)

// FailureCategory is the specific classification of a non-success result.
type FailureCategory string

const (
	FailDNS               FailureCategory = "dns_failure"
	FailBlockedDest       FailureCategory = "blocked_destination"
	FailConnRefused       FailureCategory = "connection_refused"
	FailConnReset         FailureCategory = "connection_reset"
	FailConnectTimeout    FailureCategory = "connect_timeout"
	FailTLS               FailureCategory = "tls_failure"
	FailTLSExpired        FailureCategory = "tls_expired"
	FailTLSHostname       FailureCategory = "tls_hostname_mismatch"
	FailResponseTimeout   FailureCategory = "response_timeout"
	FailUnexpectedStatus  FailureCategory = "unexpected_status"
	FailResponseTooLarge  FailureCategory = "response_too_large"
	FailInvalidJSON       FailureCategory = "invalid_json"
	FailAssertion         FailureCategory = "assertion_failed"
	FailRedirectBlocked   FailureCategory = "redirect_blocked"
	FailRedirectLimit     FailureCategory = "redirect_limit"
	FailUnsupportedScheme FailureCategory = "unsupported_scheme"
	FailInvalidConfig     FailureCategory = "invalid_configuration"
	FailWorkerError       FailureCategory = "worker_error"
	FailHeartbeatMissed   FailureCategory = "heartbeat_missed"
	FailCanceled          FailureCategory = "canceled"
	FailUnknown           FailureCategory = "unknown"
)

// WorkerStatus lifecycle states.
type WorkerStatus string

const (
	WorkerStarting WorkerStatus = "starting"
	WorkerHealthy  WorkerStatus = "healthy"
	WorkerDegraded WorkerStatus = "degraded"
	WorkerDraining WorkerStatus = "draining"
	WorkerOffline  WorkerStatus = "offline"
)

// SecretType classifies a stored monitor credential.
type SecretType string

const (
	SecretAuthorizationHeader SecretType = "authorization_header"
	SecretAPIKey              SecretType = "api_key"
	SecretBearerToken         SecretType = "bearer_token"
	SecretBasicAuth           SecretType = "basic_auth"
	SecretCustomHeader        SecretType = "custom_header"
)

// SecurityEventType classifies a monitoring protection event.
type SecurityEventType string

const (
	EvtBlockedPrivate      SecurityEventType = "blocked_private_address"
	EvtBlockedMetadata     SecurityEventType = "blocked_metadata_address"
	EvtUnsupportedScheme   SecurityEventType = "unsupported_scheme"
	EvtBlockedPort         SecurityEventType = "blocked_port"
	EvtDNSRebinding        SecurityEventType = "dns_rebinding_attempt"
	EvtRedirectToBlocked   SecurityEventType = "redirect_to_blocked"
	EvtExcessiveRedirects  SecurityEventType = "excessive_redirects"
	EvtOversizedResponse   SecurityEventType = "oversized_response"
	EvtSuspiciousDest      SecurityEventType = "suspicious_destination"
	EvtEmbeddedCredentials SecurityEventType = "embedded_credentials"
)

// AllowedSchemes and AllowedPorts constrain every destination.
var (
	AllowedSchemes = []string{"http", "https"}
	AllowedPorts   = []int{80, 443}
)

// MonitorAssertionSpec mirrors the assertion shape embedded in a version
// configuration snapshot.
type MonitorAssertionSpec struct {
	ID              string            `json:"id"`
	AssertionType   AssertionType     `json:"assertion_type"`
	FieldPath       string            `json:"field_path"`
	Operator        string            `json:"operator"`
	ExpectedValue   string            `json:"expected_value"`
	ExpectedValueTy ExpectedValueType `json:"expected_value_type"`
	CaseSensitive   bool              `json:"case_sensitive"`
	Position        int               `json:"position"`
}

// MonitorConfigSnapshot mirrors the version-faithful configuration the worker
// executes from.
type MonitorConfigSnapshot struct {
	MonitorType             MonitorType            `json:"monitor_type"`
	TargetURL               string                 `json:"target_url"`
	HTTPMethod              HTTPMethod             `json:"http_method"`
	CheckIntervalSeconds    int                    `json:"check_interval_seconds"`
	TimeoutMS               int                    `json:"timeout_ms"`
	RetryCount              int                    `json:"retry_count"`
	RetryDelayMS            int                    `json:"retry_delay_ms"`
	FollowRedirects         bool                   `json:"follow_redirects"`
	MaxRedirects            int                    `json:"max_redirects"`
	ExpectedStatusCodes     []int                  `json:"expected_status_codes"`
	ResponseTimeThresholdMS *int                   `json:"response_time_threshold_ms"`
	BodySizeLimitBytes      int64                  `json:"body_size_limit_bytes"`
	Assertions              []MonitorAssertionSpec `json:"assertions"`
	SecretIDs               []string               `json:"secret_ids"`
}
