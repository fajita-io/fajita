# Software bill of materials (SBOM) status

**Date:** 2026-07-17  
**Owner:** engineering  
**Public:** no (internal unless approved)

## Application (npm direct)

| Package | Version (approx from package.json) | Direct | Environment |
| --- | --- | --- | --- |
| next | ^15.3.0 | yes | runtime |
| react / react-dom | ^19.0.0 | yes | runtime |
| @clerk/nextjs | ^7.5.20 | yes | runtime |
| @supabase/supabase-js | ^2.110.7 | yes | runtime |
| stripe | ^22.3.2 | yes | runtime |
| zod | ^4.4.3 | yes | runtime |
| @datafast/ai-crawl | ^1.0.0 | yes | runtime |

Dev tooling (vitest, eslint, playwright, typescript, tsx, etc.) is not shipped to production runtime.

## Workers

Go module under `services/monitor-worker` and TypeScript workers under `services/` / `scripts/*-worker.ts`. Lockfiles and `go.mod` are authoritative for transitive versions.

## Vulnerability state (2026-07-17)

`npm audit --omit=dev`: **3 moderate** findings via `next` → `postcss` (GHSA-qx2v-qp2m-jg93). No fix available in current Next range at audit time. **No critical** production dependency CVE open.

Track under LB-011 until CI fails on critical and Next upgrade path is chosen deliberately.

## Generation

Full machine-readable SBOM (CycloneDX/SPDX) is deferred to a post-Stage 0 tooling pass. This document is the Phase 18 inventory baseline.
