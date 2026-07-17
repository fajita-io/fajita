# Assertion system

Phase 4. An original, typed, non-programmable assertion model
(`services/monitor-worker/internal/assertions`). There is no expression
language, no customer-supplied code, no `eval`, and no regular expressions.

## Assertion types

- HTTP status is one of approved values
- Response time is below threshold
- Response body contains text
- Response body does not contain text
- Response header contains expected value
- JSON path exists / does not exist
- JSON path equals / does not equal value
- JSON numeric value greater than / greater-or-equal / less than / less-or-equal
  threshold
- JSON contains string
- JSON boolean is true / is false
- TLS certificate expires after minimum number of days
- TLS hostname matches
- Heartbeat received within expected grace period

## Storage

Assertions are stored as typed rows (`monitor_assertions`) with:
`assertion_type`, `field_path`, `operator`, `expected_value`,
`expected_value_type`, `case_sensitive`, `position`, `enabled`. Each assertion is
tied to a `monitor_version_id` so results are attributable to the exact
configuration.

## JSON path subset

`jsonpath.go` parses a documented subset: dot-separated keys with bracket indices
(for example `data.items[0].status`). Filters and unbounded expressions are not
supported. Bounds apply to JSON depth, node count, response size, path length,
and assertion count.

## Evaluation

Each assertion is evaluated independently and produces an `Outcome` with a
bounded, sanitized summary. A fast `500` is not healthy: the status assertion
fails even when the response is quick. The overall check fails if any required
assertion fails. Body assertions summarize as `present`/`absent`; JSON equals
values are truncated (for example to 120 chars) so no secret or unbounded content
leaks into results or logs.

## Edge cases (tested)

Invalid JSON (`invalid_json`), missing path, type mismatch, null value, numeric
conversion, string comparison, and array values are covered in
`assertions_test.go`. Binary and non-UTF-8 bodies are handled safely.
