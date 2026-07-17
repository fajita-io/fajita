# Go-live approval

**Date:** 2026-07-17  
**Decided at:** 2026-07-17T23:45:00.000Z  
**Decided by:** phase-18-readiness-registry  
**Classification:** **Conditionally Ready**  
**Launch stage:** `stage_0`  
**Launch date:** 2026-07-17

## Role decisions

| Role | Decision |
| --- | --- |
| Product owner | approved (Stage 0) |
| Engineering owner | approved (Stage 0) |
| Security owner | approved (Stage 0) |
| Privacy owner | approved (Stage 0) |
| Billing owner | approved (Stage 0) |
| Operations owner | approved (Stage 0) |

## Rationale

- Classification: Conditionally Ready.
- Open critical blockers: none (remaining criticals are Stage-0 accepted risks with 2026-08-31 expiration).
- Open high blockers: LB-007, LB-012.
- Public signup and paid checkout remain off.
- No unsupported legal approval, SOC 2, penetration-test, uptime guarantee, or acquisition-readiness claim is made.

## Conditions

- Stage 0 founder-only: public signup and checkout_paid remain off.
- Do not enable BILLING_ENFORCEMENT_ENABLED until LB-005 and LB-006 are verified.
- Do not claim counsel approval until LB-003 is verified by counsel.
- Accepted Stage-0 risks expire 2026-08-31 and block Stage 2 until closed for real.
- Do not seed Stripe into the Learn Domains account; use Fajita Stripe keys only.

## Stop conditions owner

operations

## Rollback owner

engineering

## Observation period

24h intensive, 7d daily, 30d weekly (after Stage 2 only)

## Confirmations

- confirmationNoHiddenFailures: true
- confirmationNoUnsupportedClaims: true
