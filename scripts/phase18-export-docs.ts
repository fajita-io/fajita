#!/usr/bin/env tsx
/**
 * Export Phase 18 readiness markdown from the TypeScript registry.
 * Re-run after registry changes: npx tsx scripts/phase18-export-docs.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  ACCEPTED_RISKS,
  buildGoLiveApproval,
  classificationLabel,
  computeClassification,
  KNOWN_LIMITATIONS,
  LAUNCH_BLOCKERS,
  LAUNCH_STOP_CONDITIONS,
  openCriticalBlockers,
  openHighBlockers,
  READINESS_GATES,
  scorecardSummary,
  FEATURE_FLAG_LAUNCH_PLAN,
} from "../src/lib/platform/readiness";

const root = process.cwd();
const today = "2026-07-17";
const classification = computeClassification();
const approval = buildGoLiveApproval();
const summary = scorecardSummary();

function write(rel: string, body: string) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body.trimStart() + "\n", "utf8");
  console.log(`wrote ${rel}`);
}

function gateTable() {
  const header =
    "| ID | Domain | Gate | Severity | Status | Blocking | Evidence | Owner | Last tested |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |";
  const rows = READINESS_GATES.map(
    (g) =>
      `| ${g.id} | ${g.domain} | ${g.title} | ${g.severity} | ${g.status} | ${g.blocking ? "yes" : "no"} | ${g.evidence.replace(/\|/g, "/")} | ${g.owner} | ${g.lastTested ?? "—"} |`,
  );
  return [header, ...rows].join("\n");
}

function blockerTable() {
  const header =
    "| ID | Title | Domain | Severity | Status | Owner | Target | Accepted |\n| --- | --- | --- | --- | --- | --- | --- | --- |";
  const rows = LAUNCH_BLOCKERS.map(
    (b) =>
      `| ${b.id} | ${b.title} | ${b.domain} | ${b.severity} | ${b.status} | ${b.owner} | ${b.targetDate ?? "—"} | ${b.acceptedRisk ? "yes" : "no"} |`,
  );
  return [header, ...rows].join("\n");
}

write(
  "docs/readiness/final-production-readiness.md",
  `# Final production readiness

**Date:** ${today}  
**Environment:** repository audit (staging exercises partially evidenced; production smoke not complete)  
**Owner:** founder / engineering / operations  
**Classification:** **${classificationLabel(classification)}**

## Principle

> Production readiness is an evidence-backed decision, not a feeling.

## Summary

- Total gates: ${summary.totalGates}
- Status counts: ${JSON.stringify(summary.byStatus)}
- Critical gates still blocking: ${summary.criticalBlockingCount}
- Open critical blockers: ${summary.openCriticalBlockers}
- Open high blockers: ${summary.openHighBlockers}
- Launch stage approved: \`${approval.launchStage}\`

## Scorecard

${gateTable()}

## Decision

${approval.rationale.map((r) => `- ${r}`).join("\n")}

## Conditions (if later Conditionally Ready)

${approval.conditions.map((c) => `- ${c}`).join("\n")}

## Evidence package

See \`docs/handoff/phase-18-handoff.md\` and domain reviews under \`docs/security/\`, \`docs/privacy/\`, \`docs/legal/\`, \`docs/reliability/\`, \`docs/operations/\`.

## Confirmations

- No critical failure was hidden or downgraded.
- No unsupported legal approval, compliance certification, penetration test, uptime guarantee, data-loss guarantee, security guarantee, or acquisition-readiness claim is made.
- No unrelated new product scope was introduced in Phase 18.
`,
);

write(
  "docs/readiness/launch-blocker-register.md",
  `# Launch-blocker register

**Date:** ${today}  
**Owner:** operations  
**Open critical:** ${openCriticalBlockers().map((b) => b.id).join(", ") || "none"}  
**Open high:** ${openHighBlockers().map((b) => b.id).join(", ") || "none"}

${blockerTable()}

## Detail

${LAUNCH_BLOCKERS.map(
  (b) => `### ${b.id}: ${b.title}

- **Domain:** ${b.domain}
- **Severity:** ${b.severity}
- **Status:** ${b.status}
- **Description:** ${b.description}
- **Customer impact:** ${b.customerImpact}
- **Business impact:** ${b.businessImpact}
- **Security impact:** ${b.securityImpact}
- **Reproduction:** ${b.reproduction}
- **Evidence:** ${b.evidence}
- **Owner:** ${b.owner}
- **Target date:** ${b.targetDate ?? "—"}
- **Mitigation:** ${b.mitigation}
- **Verification test:** ${b.verificationTest}
- **Accepted risk:** ${b.acceptedRisk ? "yes" : "no"}
- **Approval:** ${b.approval ?? "—"}
- **Closed date:** ${b.closedDate ?? "—"}
`,
).join("\n")}
`,
);

write(
  "docs/readiness/go-live-approval.md",
  `# Go-live approval

**Date:** ${today}  
**Decided at:** ${approval.decidedAt}  
**Decided by:** ${approval.decidedBy}  
**Classification:** **${classificationLabel(approval.classification)}**  
**Launch stage:** \`${approval.launchStage}\`  
**Launch date:** ${approval.launchDate ?? "not set"}

## Role decisions

| Role | Decision |
| --- | --- |
| Product owner | ${approval.productOwner} |
| Engineering owner | ${approval.engineeringOwner} |
| Security owner | ${approval.securityOwner} |
| Privacy owner | ${approval.privacyOwner} |
| Billing owner | ${approval.billingOwner} |
| Operations owner | ${approval.operationsOwner} |

Solo-founder note: one person may hold multiple roles. Each domain still received an explicit **rejected** decision because critical blockers remain open.

## Rationale

${approval.rationale.map((r) => `- ${r}`).join("\n")}

## Stop conditions owner

${approval.stopConditionsOwner}

## Rollback owner

${approval.rollbackOwner}

## Observation period

${approval.observationPeriod}

## Confirmations

- confirmationNoHiddenFailures: ${approval.confirmationNoHiddenFailures}
- confirmationNoUnsupportedClaims: ${approval.confirmationNoUnsupportedClaims}
`,
);

write(
  "docs/readiness/known-limitations.md",
  `# Known limitations

**Date:** ${today}  
**Owner:** product

Public-safe limitations may appear in customer docs. Internal-only rows stay internal.

| ID | Limitation | Area | Priority | Public-safe | Disclosure |
| --- | --- | --- | --- | --- | --- |
${KNOWN_LIMITATIONS.map(
  (l) =>
    `| ${l.id} | ${l.limitation} | ${l.productArea} | ${l.priority} | ${l.publicSafe ? "yes" : "no"} | ${l.customerFacingDisclosure} |`,
).join("\n")}

${KNOWN_LIMITATIONS.map(
  (l) => `### ${l.id}

- Impact: ${l.impact}
- Workaround: ${l.workaround}
- Owner: ${l.owner}
- Planned review: ${l.plannedReview}
`,
).join("\n")}
`,
);

write(
  "docs/readiness/accepted-risks.md",
  `# Accepted risks

**Date:** ${today}

Critical risks are **not** accepted for launch while classification is Not Ready. The rows below are candidates only; approver remains pending.

| ID | Risk | Severity | Expiration | Approver |
| --- | --- | --- | --- | --- |
${ACCEPTED_RISKS.map(
  (r) =>
    `| ${r.id} | ${r.risk} | ${r.severity} | ${r.expiration} | ${r.approver} |`,
).join("\n")}

${ACCEPTED_RISKS.map(
  (r) => `### ${r.id}

- Evidence: ${r.evidence}
- Why not fixed: ${r.whyNotFixed}
- Mitigation: ${r.mitigation}
- Monitoring: ${r.monitoring}
- Owner: ${r.owner}
- Review date: ${r.reviewDate}
`,
).join("\n")}
`,
);

// Security reviews
const securityDocs: Array<[string, string, string]> = [
  [
    "docs/security/final-threat-model.md",
    "Final threat model",
    `Internal threat model covering marketing, auth, orgs, monitors, workers, DNS/SSRF, incidents, alerts, status pages, billing, affiliates, Pamphlet, internal ops, exports, deletion, webhooks, analytics, flags, approvals, backups, deployment, and acquisition exports.

**Status:** Draft complete for counsel/security review. **Not public.**

Public-safe summary: Fajita uses Clerk authentication, server-side authorization, Supabase RLS, SSRF controls on monitor egress, signed provider webhooks, and graded platform-admin permissions. Residual risks include missing APM, incomplete counsel review, and unrestored backup exercise evidence.

High-priority threat categories reviewed: cross-tenant access, credential theft, SSRF/DNS rebinding, webhook forgery, billing fraud, affiliate fraud, support prompt injection, privilege escalation, export/deletion abuse, supply-chain compromise, monitoring false positives/negatives, public status misinformation.

Full asset/attacker/entry/control/residual/test matrices live with the Phase 4–17 security docs plus this Phase 18 consolidation. Do not publish exploitable details.`,
  ],
  [
    "docs/security/final-security-architecture-review.md",
    "Final security architecture review",
    `Trust boundaries reviewed: browser↔Next.js, workers↔Postgres, providers (Clerk/Stripe/Resend/Pamphlet), internal admin, org tenancy, analytics, exports, backups.

Verified in code: server-side authz for app routes; service-role containment for workers/ops; secret isolation via env; environment separation documented; tenant isolation via RLS + org scoping; least privilege platform roles; fail-closed internal APIs when tokens unset.

**Independent review:** not claimed. This is an internal architecture review by the implementing team during Phase 18.`,
  ],
  [
    "docs/security/final-authentication-review.md",
    "Final authentication review",
    `Clerk middleware protects \`/app\` and \`/internal\`. Invitation flows covered by \`tests/app-invitations.test.ts\` and invitation security docs. Platform admin bootstrap via \`PLATFORM_ADMIN_USER_IDS\`.

Gaps: production smoke of MFA/session revocation matrix pending (LB-008). Email enumeration residual depends on Clerk defaults. No custom session cryptography.`,
  ],
  [
    "docs/security/final-authorization-review.md",
    "Final authorization review",
    `Customer roles: owner/admin/member/viewer in \`src/lib/auth/roles.ts\`. Platform roles in \`src/lib/platform/permissions.ts\`. UI hiding is never the sole control.

Cross-tenant SQL harness: Phase 3/4. Billing deny-by-default for webhook inbox tables. Residual: LB-010 billing/platform SQL harness.`,
  ],
  [
    "docs/security/final-rls-review.md",
    "Final RLS review",
    `Automated inventory: \`scripts/rls-inventory.ts\` (must pass). Surviving public tables enable RLS. Intentional no-policy tables are service-role only (secrets, leases, webhook events, platform ops).

Customer-mutable audit/provider tables: denied by design.`,
  ],
  [
    "docs/security/final-ssrf-review.md",
    "Final SSRF review",
    `Go monitor worker destination validation + dial pinning passed \`${today}\` (\`go test ./internal/destination ./internal/executor\`). TypeScript preflight mirrors CIDR blocks. Alert webhooks reuse blocked-IP checks with no redirects.

Free networked HTTP tool: deferred (fail closed). DNS rebinding: connect-to-validated-IP strategy documented in \`docs/security/dns-rebinding-defense.md\`.`,
  ],
  [
    "docs/security/final-secret-management-review.md",
    "Final secret management review",
    `Inventory categories: Clerk, Supabase, Stripe, Resend, Slack/Discord, Pamphlet, DNS/TLS, Vercel, GitHub, analytics, encryption keyrings, worker tokens, cron secrets.

Storage: provider dashboards + Vercel/env. Values never stored in this inventory. \`scripts/secret-scan.ts\` scans tracked files. Rotation exercises: staging planned; production rotation requires maintenance approval.`,
  ],
  [
    "docs/security/final-webhook-review.md",
    "Final webhook review",
    `Stripe: signature verify then \`processStripeWebhookEvent\` with inbox idempotency (\`billing_webhook_events\`). Clerk/Resend/subscriber webhooks follow signature + token patterns per prior phases.

Tests: \`src/lib/billing/webhook-inbox.test.ts\`. Residual: LB-009 route-level signature e2e.`,
  ],
  [
    "docs/security/final-admin-security-review.md",
    "Final admin security review",
    `\`/internal\` gated by \`allowInternalPage\`, noindex, graded permissions, approval workflows for destructive ops. Customer roles cannot access internal. Dev open-internal only when admin list empty and non-production.`,
  ],
  [
    "docs/security/final-dependency-review.md",
    "Final dependency review",
    `Lockfile present. Phase 18 requires \`npm audit\` evidence before Stage 2 (LB-011). No blind mass upgrades. SBOM: see handoff package. Unused packages not removed in this phase unless critical CVE.`,
  ],
  [
    "docs/security/final-container-review.md",
    "Final container review",
    `Monitor and background workers under \`services/\`. Review targets: nonroot where configured, no embedded secrets, resource limits, health checks. Residual: pin digests where practical before Stage 2.`,
  ],
  [
    "docs/security/final-cicd-review.md",
    "Final CI/CD review",
    "GitHub Actions workflows under .github reviewed for secret exposure to forks. Production secrets must not run on untrusted PRs. Branch protection and required checks: confirm on GitHub org settings (ownership manifest).",
  ],
  [
    "docs/security/vulnerability-management.md",
    "Vulnerability management",
    `Statuses: Reported → Validating → Confirmed → Mitigating → Fixed → Verified → Disclosed / Rejected / Duplicate / Accepted risk.

Severity considers exploitability, data exposure, tenant impact, auth requirement, scope, persistence, business impact.

Public remediation SLAs are not promised. Responsible disclosure route: public security/contact surfaces per site legal pages.

External review package: architecture, scope, staging accounts, rules of engagement, cleanup. No production customer data for testers.`,
  ],
];

for (const [path, title, body] of securityDocs) {
  write(
    path,
    `# ${title}

**Date:** ${today}  
**Owner:** security / engineering  
**Classification context:** ${classificationLabel(classification)}

${body}
`,
  );
}

const privacyDocs: Array<[string, string]> = [
  [
    "docs/privacy/final-data-map.md",
    `Consolidates phase data maps (through Phase 17) for accounts, orgs, monitors, checks, incidents, alerts, status pages, subscribers, billing, affiliates, support, analytics, audit, exports, backups, providers.

Each category records purpose, source, storage, processor, retention, access, export, deletion, legal-retention exception, encryption, region placeholder, owner.

See also \`.cursor/maturity-memory/data-inventory.md\` (update drift where webhook persistence is now implemented).`,
  ],
  [
    "docs/privacy/final-retention-review.md",
    `Retention jobs and plan entitlements must match Privacy Policy and product behavior. Financial and security records are not deleted contrary to required retention. Customer content beyond policy must not be retained.

Status: documented; enforcement jobs exist per prior phases. Production verification pending smoke (LB-008).`,
  ],
  [
    "docs/privacy/final-export-review.md",
    `Exports require correct requester, org scope, permissions, secret exclusion, internal-note exclusion, expiring URLs, audit. Omitted secrets and legally retained data must be stated.

Status: platform privacy export queues exist; production fixture export pending.`,
  ],
  [
    "docs/privacy/final-deletion-review.md",
    `User/org/subscriber/support/affiliate deletion paths documented with grace, irreversibility warnings, provider propagation. Do not claim complete deletion while provider deletion is pending.

Status: workflows exist; production fixture deletion pending smoke.`,
  ],
  [
    "docs/privacy/final-subprocessor-inventory.md",
    `| Provider | Purpose | Contract/DPA state |
| --- | --- | --- |
| Vercel | Hosting | Verify before launch |
| Supabase | Database | Verify before launch |
| Clerk | Auth | Verify before launch |
| Stripe | Billing | Verify before launch |
| Resend | Email | Verify before launch |
| Pamphlet | Support chatbot | Verify before launch |
| Slack / Discord | Customer alert destinations (customer-controlled) | N/A customer processors |
| DataFast | Analytics | Verify before launch |
| DNS/TLS provider | Custom domains | Verify before launch |

Do not claim contractual terms that have not been verified. Counsel review required (LB-003).`,
  ],
];

for (const [path, body] of privacyDocs) {
  write(
    path,
    `# ${path.split("/").pop()?.replace(".md", "").replace(/-/g, " ")}

**Date:** ${today}  
**Owner:** privacy

${body}
`,
  );
}

const legalDocs: Array<[string, string]> = [
  [
    "docs/legal/final-counsel-review-package.md",
    `## Counsel-review status

**Status: Counsel review required**

Public drafts exist at \`/legal/*\` (Terms, Privacy, Cookies, Acceptable Use, Refunds, Disclosure, Affiliate agreement/privacy).

Do **not** state that counsel approved these documents.

Additional drafts for counsel package: DPA, subprocessor list, security overview, responsible disclosure, cancellation, status-page subscriber notice, chatbot disclosure, electronic communications consent, retention schedule, law-enforcement process placeholder, company contact (Fajita, 1001 S Main St, Ste 600, Kalispell, MT 59901).

States: Draft · Internal review complete · **Counsel review required** · Counsel approved.`,
  ],
  [
    "docs/legal/terms-review.md",
    `Reviewed against \`src/lib/legal/terms.ts\` for eligibility, org authority, acceptable use, monitoring destinations, prohibited scanning, payment/renewal, cancellation/refunds, limits, affiliates, disclaimers, liability placeholders.

Product behavior must remain consistent. Governing law placeholder remains for counsel.`,
  ],
  [
    "docs/legal/privacy-policy-review.md",
    `Reviewed against \`src/lib/legal/privacy.ts\` for collection, cookies, analytics, affiliates, subscribers, billing, Pamphlet, subprocessors, retention, export/deletion, children, contact.

Do not claim data is never shared with subprocessors. Do not claim analytics never runs if DataFast is present.`,
  ],
  [
    "docs/legal/acceptable-use-review.md",
    `Reviewed against \`src/lib/legal/acceptable-use.ts\` for unauthorized monitoring, scanning, DoS, webhook abuse, affiliate fraud, subscriber spam. Exact abuse thresholds are not published.`,
  ],
  [
    "docs/legal/affiliate-terms-review.md",
    `Reviewed against affiliate agreement drafts and implementation (attribution window, holding period, refund/dispute reversal, self-referral bans). Do not promise lifetime commissions if code uses a bounded term.`,
  ],
];

for (const [path, body] of legalDocs) {
  write(
    path,
    `# ${path.split("/").pop()?.replace(".md", "").replace(/-/g, " ")}

**Date:** ${today}  
**Owner:** privacy / counsel  
**Counsel status:** review required

${body}
`,
  );
}

const reliabilityDocs: Array<[string, string]> = [
  [
    "docs/reliability/final-monitoring-review.md",
    `Scheduler leases, SKIP LOCKED, worker loss, duplicate prevention covered in Phase 4 tests and docs. Go destination/executor tests passed ${today}. False-positive/negative matrices documented in prior phase testing docs; tradeoff favors confirmation before customer-facing outage declaration.`,
  ],
  [
    "docs/reliability/final-incident-review.md",
    `Incident state machine unit tests pass. History append-only with correction events. Maintenance and flapping behavior per Phase 6 engine docs.`,
  ],
  [
    "docs/reliability/final-alert-review.md",
    `Email/Slack/Discord/webhook providers with retry, dead letter, signing. Unit tests for SSRF and signing. Production real-alert tests: LB-007 open.`,
  ],
  [
    "docs/reliability/final-status-page-review.md",
    `Public status routes independent of Clerk protect. Custom domain serve requires verified + TLS active. Privacy sanitization tests in \`tests/status-pages.test.ts\`. Official Fajita status page production config: LB-012.`,
  ],
  [
    "docs/reliability/capacity-model.md",
    `Launch model uses measured prior-phase throughput, not fantasy growth.

| Horizon | Active orgs | Active monitors | Checks/day (order) | Notes |
| --- | --- | --- | --- | --- |
| Expected launch | tens | hundreds | low thousands | Stage 1 caps |
| 10× | hundreds | thousands | tens of thousands | Scale trigger: queue lag |
| 90-day | low thousands | tens of thousands | verify DB/worker CPU | Revisit indexes |

Ceiling: first bottleneck historically check-result write + worker concurrency. Stop conditions in launch control.`,
  ],
  [
    "docs/reliability/load-test-results.md",
    `Reuses \`docs/testing/phase-17-load-results.md\` and earlier matrices. Phase 18 did not re-run uncontrolled 10× against production providers. Staging load acceptable for Stage 0/1 with caps.`,
  ],
  [
    "docs/reliability/stress-test-results.md",
    `Stress objective: find first bottleneck and failure mode. Documented stop: queue lag / DB connections. Not infinite scale. Full re-stress deferred under AR-003.`,
  ],
  [
    "docs/reliability/soak-test-results.md",
    `Multi-day soak not re-executed in Phase 18 window (AR-003). Prior phase sustained runs showed no known memory leak in monitor worker under fixture load. Re-run before Stage 2.`,
  ],
  [
    "docs/reliability/chaos-test-results.md",
    `Controlled staging chaos scenarios (worker kill, provider 429, duplicate webhook, corrupt read model) are tabletop + partial prior-phase drills. Production chaos forbidden. See tabletop exercises doc.`,
  ],
  [
    "docs/reliability/provider-outage-exercises.md",
    `| Provider | Customer effect | Degraded mode | Manual process |
| --- | --- | --- | --- |
| Clerk | Auth down | Status page still public | Wait / status comms |
| Supabase | App + monitors impacted | Pause noncritical jobs | Restore / provider status |
| Stripe | Checkout/billing webhooks delayed | Entitlements freeze safe | Reconciliation |
| Resend | Email alerts delayed | Slack/Discord/webhook remain | Retry / dead letter |
| Pamphlet | Chat unavailable | Human email handoff | Fallback copy |
| Vercel | App deploy path | Status CDN path prioritized | Rollback |

Detailed runbooks in disaster-recovery plan.`,
  ],
  [
    "docs/reliability/database-restore-exercise.md",
    `## Result: PARTIAL (LB-004 still open)

Schema dump evidence recorded 2026-07-17:

- Artifact: /tmp/fajita-phase18-schema.sql (28245 lines)
- SHA-256: f9390a01883b8d27e3b26462a8a604d5893005683529be3f513d72f789c17c05
- Supabase API: pitr_enabled=false, walg_enabled=true, backups=[]
- Isolated restore not completed (no Docker/local Postgres in session)

Do not call backups complete until isolated restore + app smoke pass. Prefer the detailed file contents if they diverge after manual updates.`,
  ],
  [
    "docs/reliability/disaster-recovery-plan.md",
    `Scenarios: DB loss/corruption, web/worker deploy failure, region loss, credential compromise, webhook loss, alert-provider outage, DNS/custom-domain failure, Pamphlet outage, repo compromise, admin account compromise.

Each: detect → authority → contain → impact → restore → reconcile → communicate → verify → return → follow-up.

RPO/RTO targets in recovery-objectives.md (targets, not contractual promises).`,
  ],
  [
    "docs/reliability/recovery-objectives.md",
    `| System | RTO target | RPO target | Tested | Gap |
| --- | --- | --- | --- | --- |
| Authenticated app | 4h | 1h | untested restore | LB-004 |
| Monitoring scheduler | 1h | 15m | partial worker drills | — |
| Alert delivery | 2h | 15m | unit only | LB-007 |
| Public status pages | 30m | 15m | architecture independence | LB-012 |
| Billing webhooks | 4h | near-zero (Stripe retry) | code idempotency | LB-006 |

Not published as contractual SLAs.`,
  ],
];

for (const [path, body] of reliabilityDocs) {
  write(
    path,
    `# ${path.split("/").pop()?.replace(".md", "").replace(/-/g, " ")}

**Date:** ${today}  
**Owner:** operations / engineering

${body}
`,
  );
}

const opsDocs: Array<[string, string]> = [
  [
    "docs/operations/final-incident-response-plan.md",
    `Roles (solo-founder may combine): incident commander, technical lead, communications, security, privacy, billing, support.

Stages: Detect → Triage → Declare → Contain → Investigate → Mitigate → Communicate → Recover → Verify → Review → Remediate.

Severity definitions internal. No public internal contact details.`,
  ],
  [
    "docs/operations/tabletop-exercises.md",
    `## Exercises recorded ${today} (tabletop)

### A: Cross-tenant exposure suspicion
Immediate restrict → preserve evidence → scope → comms decision → rotate → audit. Gap: APM paging (LB-001).

### B: Scheduler backlog
Detect lag → scale/drain workers → customer impact → status decision. Gap: live lag dashboards depend on ops metrics availability.

### C: Stripe webhook outage
Backlog → entitlement safety (no grant on success URL alone) → reconcile. Gap: live payment test (LB-006).

### D: Provider credential compromise
Revoke → rotate → continuity → audit.

### E: Database restoration
Decision → restore → RPO/RTO. Gap: LB-004 evidence.`,
  ],
  [
    "docs/operations/failed-deployment-exercise.md",
    `Staging exercise required: deploy failing version → health fail → protect traffic → rollback → migration safety → workers isolated → status pages → measure rollback time.

**Status:** procedure documented; execution evidence pending before Stage 1.`,
  ],
  [
    "docs/operations/production-smoke-test.md",
    `## Public smoke: PASSED locally (2026-07-17)

\`SMOKE_BASE_URL=http://127.0.0.1:3018 npm run smoke:public\` passed against a production build.

\`https://fajita.io\` did not resolve yet. Authenticated checklist still NOT RUN (LB-008).

Fixtures must be marked is_internal and excluded from revenue metrics.`,
  ],
  [
    "docs/operations/real-payment-test.md",
    `## Status: NOT RUN (LB-006)

Controlled live payment: checkout → customer → subscription → invoice → payment → webhook → Fajita state → entitlements → receipt → portal → cancel → optional refund → affiliate exclusion → cleanup.`,
  ],
  [
    "docs/operations/real-alert-tests.md",
    `## Status: NOT RUN (LB-007)

Internal destinations only for email, Slack, Discord, generic webhook: setup, test, incident, recovery, logs, no duplicates.`,
  ],
  [
    "docs/operations/launch-entry-criteria.md",
    `### Before Stage 0
Critical security/RLS/SSRF tests pass (code evidence yes). Billing test mode. Backups configured (restore evidence no). Rollback tested (pending). Status page live (LB-012). Internal alerts (APM LB-001). Runbooks available (yes).

### Before Stage 1
Production smoke (LB-008), real payment (LB-006), real alerts (LB-007), support handoff, no unresolved high security issue.

### Before Stage 2
Pilot review, legal pages counsel path, privacy disclosures, incident process ready.`,
  ],
  [
    "docs/operations/launch-stop-conditions.md",
    `${LAUNCH_STOP_CONDITIONS.map((s) => `- **${s.id}** (${s.severity}): ${s.title}`).join("\n")}

On trigger: pause launch → disable flag → declare incident → runbook → communicate → reconcile → reapprove.`,
  ],
  [
    "docs/operations/staged-launch-plan.md",
    `## Stage 0: Internal production verification
Founder only, fixture org, real infra, signup public off.

## Stage 1: Trusted pilot
Small approved group, monitor caps, daily review.

## Stage 2: Controlled public launch
Signup on with flags, command center staffed.

## Stage 3: Normal operations
After observation period and blocker closure.

Feature flags:
${FEATURE_FLAG_LAUNCH_PLAN.map((f) => `- \`${f.flag}\` default ${f.default} (owner ${f.owner})`).join("\n")}

Configuration freeze: pricing, entitlements, intervals, retention, affiliate terms, critical flags. Changes need reason, approval, test, docs, rollback.`,
  ],
  [
    "docs/operations/launch-day-command-center.md",
    `UI: \`/internal/launch\`. Shows stage, classification, blockers, stop conditions, flag plan, permissioned action links. No arbitrary production shell.`,
  ],
  [
    "docs/operations/post-launch-observation.md",
    `24h intensive → 7d daily → 30d weekly. Track signup, payment, activation, check delay, alert delivery, support, cost, queue growth. Do not remove safeguards after first signup.`,
  ],
  [
    "docs/operations/post-launch-review.md",
    `Template: timeline, metrics, incidents, security, payments, monitoring, alerts, support, costs, capacity, flags, stop events, decisions, fixes, deferred work, readiness for normal ops. Require evidence.`,
  ],
  [
    "docs/operations/business-continuity.md",
    `Coverage for founder unavailability, provider outages, billing/monitoring/support/DNS issues, credential loss, repo issue, restore, legal request, security incident.

Emergency credentials are **not** stored in the repository. Use approved secret store / escrow.`,
  ],
  [
    "docs/operations/key-person-risk.md",
    `Processes currently founder-concentrated: deploy, restore, billing reconcile, domain renewal, secret rotation, security incident, affiliate payout, privacy deletion, support escalation, acquisition export, legal contacts.

Each has or needs: documentation, runbook, backup owner placeholder, access-transfer process, test evidence.`,
  ],
  [
    "docs/operations/runbook-validation.md",
    `Critical runbooks must be executed or tabletop tested. Phase 18 tabletops recorded for A–E. Restore, real payment, real alerts, failed deploy execution still open (see blockers).`,
  ],
];

for (const [path, body] of opsDocs) {
  write(
    path,
    `# ${path.split("/").pop()?.replace(".md", "").replace(/-/g, " ")}

**Date:** ${today}  
**Owner:** operations

${body}
`,
  );
}

write(
  "docs/performance/final-performance-audit.md",
  `# Final performance audit

**Date:** ${today}

Budgets align with \`.cursor/experience-memory/performance-budget.md\` and prior phase budgets. Public CWV targets: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.

Phase 18 did not replace prior measurements with a full Lighthouse sweep of every route. Re-measure Stage 0 production fixtures before Stage 2.

Workers remain isolated from marketing analytics paths.
`,
);

write(
  "docs/accessibility/final-accessibility-audit.md",
  `# Final accessibility audit

**Date:** ${today}

Surfaces in scope: marketing, auth, app shell, monitors, incidents, alerts, status pages, billing, docs/glossary/blog/tools, Pamphlet, internal ops.

No accessibility overlay. Critical blockers should be fixed before Stage 2. Keyboard/focus patterns exist in app chrome; full screen-reader matrix on mobile is staging-limited.

Status: passed with condition (re-test key journeys during Stage 0 smoke).
`,
);

write(
  "docs/handoff/production-ownership-manifest.md",
  `# Production ownership manifest

**Date:** ${today}

| Asset | Legal owner | Admin owner | Billing owner | Technical owner | Recovery | Transfer |
| --- | --- | --- | --- | --- | --- | --- |
| Domain(s) | Fajita entity TBD | founder | founder | founder | registrar MFA + backup codes (off-repo) | registrar transfer |
| GitHub repo | Fajita | founder | n/a | founder | org ownership | GitHub transfer |
| Vercel | Fajita | founder | founder | founder | team access | project transfer |
| Supabase olvnjsqspvywvwfchtuc | Fajita | founder | founder | founder | org + MFA | project transfer |
| Clerk | Fajita | founder | founder | founder | MFA | instance transfer |
| Stripe | Fajita | founder | founder | founder | MFA | account transfer rules |
| Resend | Fajita | founder | founder | founder | MFA | domain + API |
| Pamphlet | Fajita | founder | founder | founder | MFA | workspace transfer |
| DataFast | Fajita | founder | founder | founder | MFA | property transfer |

Entity suffix TBD. Do not leave critical infrastructure on an undocumented personal email without recovery planning.
`,
);

write(
  "docs/handoff/acquisition-transfer-package.md",
  `# Acquisition transfer package

**Date:** ${today}  
**Secrets:** none included

## Corporate and ownership
Entity placeholder, product/domain/repo/brand/IP inventory pointers.

## Technology
Architecture docs under \`docs/engineering/\`, providers, environments, workers in \`services/\`, backups, SBOM process, runbooks.

## Product
Features shipped through Phase 17; known limitations in \`docs/readiness/known-limitations.md\`.

## Revenue
Stripe as system of record; MRR definitions in platform metrics; affiliate liabilities; refunds/disputes.

## Customers
Aggregate inventory via internal ops (no customer PII in this package).

## Security and privacy
Threat model, controls, privacy map, subprocessors, deletion, audit.

## Content and growth
Docs, glossary, blog, comparisons, tools, SEO, llms.txt, affiliates.

## Operations
Command center, approvals, flags, reconciliation, reports, costs, calendar.

## Transfer checklists
Account transfer, credential rotation, DNS, GitHub, providers, billing, support, DPA updates.

Fajita remains a standalone repository, transferable independently from unrelated Accomplish products.
`,
);

write(
  "docs/handoff/transfer-dry-run.md",
  `# Transfer dry run

**Date:** ${today}  
**Type:** tabletop

Assumed buyer/operator steps 1–18 from Phase 18 brief were walked against documentation.

Undocumented dependencies found and addressed in this phase:
- Readiness/launch surfaces now in-repo (\`/internal/readiness\`, \`/internal/launch\`)
- Scorecard previously only in stale maturity memory; now registry + export
- Restore exercise still missing evidence (LB-004)
- APM vendor still unresolved (LB-001)

Result: transfer documentation improved; **not** acquisition-ready while critical ops evidence gaps remain.
`,
);

write(
  "docs/handoff/phase-18-handoff.md",
  `# Phase 18 handoff

**Date:** ${today}  
**Classification:** **${classificationLabel(classification)}**

## What shipped

- Readiness registry: \`src/lib/platform/readiness/*\`
- Ops UI: \`/internal/readiness\`, \`/internal/readiness/[domain]\`, \`/internal/launch\`
- Docs package under \`docs/readiness\`, \`docs/security/final-*\`, \`docs/privacy/final-*\`, \`docs/legal/final-*\`, \`docs/reliability/*\`, \`docs/operations/*\`, handoff package
- Automation: \`scripts/rls-inventory.ts\`, \`scripts/secret-scan.ts\`, \`scripts/phase18-export-docs.ts\`
- Billing inbox pure helpers + tests: \`src/lib/billing/webhook-inbox.ts\`

## What did not ship

- Error monitoring vendor
- Counsel approval
- Proven DB restore
- Live price verification
- Live payment / alert / smoke tests
- Billing enforcement enablement

## Go-live

**Not Ready.** Do not enable public paid launch. Stage 0 founder-only verification is allowed for non-customer traffic.

## Commands

\`\`\`bash
npx tsx scripts/rls-inventory.ts
npx tsx scripts/secret-scan.ts
npx tsx scripts/phase18-export-docs.ts
npm test
npm run typecheck
(cd services/monitor-worker && go test ./internal/destination ./internal/executor)
\`\`\`
`,
);

write(
  "docs/readiness/evidence-manifest.md",
  `# Evidence manifest

**Date:** ${today}

| Artifact | Location | Result | Limitations |
| --- | --- | --- | --- |
| Scorecard | docs/readiness/final-production-readiness.md | ${classificationLabel(classification)} | — |
| Blockers | docs/readiness/launch-blocker-register.md | open critical ${openCriticalBlockers().length} | — |
| Go-live | docs/readiness/go-live-approval.md | rejected | — |
| SSRF tests | monitor-worker Go tests | pass ${today} | staging fixtures |
| Vitest | npm test | pass (incl. webhook-inbox + readiness) | not full e2e |
| RLS inventory | scripts/rls-inventory.ts | must pass | SQL harness gap LB-010 |
| Secret scan | scripts/secret-scan.ts | must pass | not gitleaks history |
| Restore | docs/reliability/database-restore-exercise.md | partial dump; PITR off | LB-004 |
| Live payment | docs/operations/real-payment-test.md | not run (no Fajita Stripe keys) | LB-006 |
| Public smoke | scripts/public-smoke.ts | passed locally | LB-008 mitigating |
| Sentry | @sentry/nextjs wired | DSN pending in Vercel | LB-001 closed |
`,
);

console.log("\nPhase 18 docs export complete.");
console.log(`Classification: ${classificationLabel(classification)}`);
