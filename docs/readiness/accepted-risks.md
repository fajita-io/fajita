# Accepted risks

**Date:** 2026-07-17

Critical risks are **not** accepted for launch while classification is Not Ready. The rows below are candidates only; approver remains pending.

| ID | Risk | Severity | Expiration | Approver |
| --- | --- | --- | --- | --- |
| AR-001 | No independent penetration test before initial launch | high | 2026-10-01 | pending founder (blocked by Not Ready classification) |
| AR-002 | Solo-founder multi-role incident command | medium | 2026-12-01 | pending founder (blocked by Not Ready classification) |
| AR-003 | Phase 18 did not re-run multi-day soak at 10x capacity | medium | 2026-08-31 | pending founder (blocked by Not Ready classification) |

### AR-001

- Evidence: docs/security/vulnerability-management.md external review package prepared
- Why not fixed: Commercial timeline; internal adversarial tests and SSRF/RLS suites exist.
- Mitigation: External review package ready; responsible disclosure policy published; Stage 0 limited audience.
- Monitoring: Security queue in /internal/security; disclosure inbox
- Owner: security
- Review date: 2026-08-15

### AR-002

- Evidence: docs/operations/key-person-risk.md
- Why not fixed: Headcount constraint at launch.
- Mitigation: Documented roles, runbooks, provider support contacts, backup access procedures.
- Monitoring: Launch command center; calendar coverage
- Owner: operations
- Review date: 2026-09-01

### AR-003

- Evidence: docs/reliability/soak-test-results.md; prior phase load results
- Why not fixed: Timeboxed Phase 18; prior load evidence reused with documented limits.
- Mitigation: Capacity model + stop conditions; Stage 1 monitor caps.
- Monitoring: Queue lag metrics; launch stop conditions
- Owner: operations
- Review date: 2026-08-07


