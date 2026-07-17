# Final threat model

**Date:** 2026-07-17  
**Owner:** security / engineering  
**Classification context:** Not Ready

Internal threat model covering marketing, auth, orgs, monitors, workers, DNS/SSRF, incidents, alerts, status pages, billing, affiliates, Pamphlet, internal ops, exports, deletion, webhooks, analytics, flags, approvals, backups, deployment, and acquisition exports.

**Status:** Draft complete for counsel/security review. **Not public.**

Public-safe summary: Fajita uses Clerk authentication, server-side authorization, Supabase RLS, SSRF controls on monitor egress, signed provider webhooks, and graded platform-admin permissions. Residual risks include missing APM, incomplete counsel review, and unrestored backup exercise evidence.

High-priority threat categories reviewed: cross-tenant access, credential theft, SSRF/DNS rebinding, webhook forgery, billing fraud, affiliate fraud, support prompt injection, privilege escalation, export/deletion abuse, supply-chain compromise, monitoring false positives/negatives, public status misinformation.

Full asset/attacker/entry/control/residual/test matrices live with the Phase 4–17 security docs plus this Phase 18 consolidation. Do not publish exploitable details.

