/**
 * Fajita monitoring engine shared contracts (canonical TypeScript source).
 *
 * This file and its Go mirror (contract.go) define the vocabulary shared by the
 * web application, the database, and the Go worker: monitor types and statuses,
 * assertion types and operators, result and failure taxonomies, worker states,
 * and the contract version.
 *
 * CONTRACT_VERSION is bumped on any breaking change to these enums or to the
 * worker database functions. A worker whose contract version does not match the
 * one it registers against fails readiness rather than risk corrupting data
 * (see docs/engineering/worker-contracts.md). Keep contract.ts and contract.go
 * in lockstep; drift is a release blocker.
 */

export const CONTRACT_VERSION = 1 as const;

export const MONITOR_TYPES = ["http", "https", "api", "ssl", "heartbeat"] as const;
export type MonitorType = (typeof MONITOR_TYPES)[number];

export const MONITOR_STATUSES = [
  "draft",
  "active",
  "paused",
  "disabled",
  "pending_deletion",
  "deleted",
] as const;
export type MonitorStatus = (typeof MONITOR_STATUSES)[number];

export const HTTP_METHODS = ["GET", "HEAD", "POST"] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

/** Approved check intervals in seconds. No arbitrary sub-minute intervals. */
export const CHECK_INTERVALS_SECONDS = [60, 300, 600, 900, 1800, 3600] as const;
export type CheckIntervalSeconds = (typeof CHECK_INTERVALS_SECONDS)[number];

export const ASSERTION_TYPES = [
  "status_code_in",
  "response_time_below",
  "body_contains",
  "body_not_contains",
  "header_equals",
  "json_path_exists",
  "json_path_not_exists",
  "json_path_equals",
  "json_path_not_equals",
  "json_number_gt",
  "json_number_gte",
  "json_number_lt",
  "json_number_lte",
  "json_contains_string",
  "json_boolean_true",
  "json_boolean_false",
  "tls_valid",
  "tls_hostname_matches",
  "tls_expires_after_days",
  "heartbeat_within_grace",
] as const;
export type AssertionType = (typeof ASSERTION_TYPES)[number];

export const EXPECTED_VALUE_TYPES = [
  "string",
  "number",
  "boolean",
  "duration",
  "none",
] as const;
export type ExpectedValueType = (typeof EXPECTED_VALUE_TYPES)[number];

/** Overall check outcome. */
export const RESULT_STATUSES = [
  "success",
  "failure",
  "error",
  "timed_out",
  "blocked",
  "canceled",
] as const;
export type ResultStatus = (typeof RESULT_STATUSES)[number];

/** Specific failure classification, separate from the overall status. */
export const FAILURE_CATEGORIES = [
  "dns_failure",
  "blocked_destination",
  "connection_refused",
  "connection_reset",
  "connect_timeout",
  "tls_failure",
  "tls_expired",
  "tls_hostname_mismatch",
  "response_timeout",
  "unexpected_status",
  "response_too_large",
  "invalid_json",
  "assertion_failed",
  "redirect_blocked",
  "redirect_limit",
  "unsupported_scheme",
  "invalid_configuration",
  "worker_error",
  "heartbeat_missed",
  "canceled",
  "unknown",
] as const;
export type FailureCategory = (typeof FAILURE_CATEGORIES)[number];

export const WORKER_STATUSES = [
  "starting",
  "healthy",
  "degraded",
  "draining",
  "offline",
] as const;
export type WorkerStatus = (typeof WORKER_STATUSES)[number];

export const SECRET_TYPES = [
  "authorization_header",
  "api_key",
  "bearer_token",
  "basic_auth",
  "custom_header",
] as const;
export type SecretType = (typeof SECRET_TYPES)[number];

export const SECURITY_EVENT_TYPES = [
  "blocked_private_address",
  "blocked_metadata_address",
  "unsupported_scheme",
  "blocked_port",
  "dns_rebinding_attempt",
  "redirect_to_blocked",
  "excessive_redirects",
  "oversized_response",
  "abusive_test_requests",
  "invalid_heartbeat_token_volume",
  "rate_limit_enforced",
  "suspicious_destination",
  "embedded_credentials",
] as const;
export type SecurityEventType = (typeof SECURITY_EVENT_TYPES)[number];

/** Only http and https targets are ever executed. */
export const ALLOWED_SCHEMES = ["http", "https"] as const;
/** Only these destination ports are permitted. */
export const ALLOWED_PORTS = [80, 443] as const;

/** Envelope-encryption format prefix for monitor secrets: v<keyVersion>:... */
export const SECRET_ENVELOPE_ALGORITHM = "AES-256-GCM" as const;

/**
 * The configuration snapshot embedded in monitor_versions. The worker executes
 * from this snapshot for version fidelity. Secrets are referenced by id, never
 * inlined.
 */
export interface MonitorConfigSnapshot {
  monitor_type: MonitorType;
  target_url: string | null;
  http_method: HttpMethod;
  check_interval_seconds: number;
  timeout_ms: number;
  retry_count: number;
  retry_delay_ms: number;
  follow_redirects: boolean;
  max_redirects: number;
  expected_status_codes: number[];
  response_time_threshold_ms: number | null;
  body_size_limit_bytes: number;
  assertions: MonitorAssertionSpec[];
  secret_ids: string[];
}

export interface MonitorAssertionSpec {
  id: string | null;
  assertion_type: AssertionType;
  field_path: string | null;
  operator: string | null;
  expected_value: string | null;
  expected_value_type: ExpectedValueType;
  case_sensitive: boolean;
  position: number;
}
