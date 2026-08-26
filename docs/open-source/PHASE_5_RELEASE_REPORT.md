# Phase 5 release report

Date: 2026-08-26 (updated after pre-public execution)

## Executive Summary

Pre-public launch work is **complete**. Site OSS surfaces are live, validation gates pass, launch content is prepared, and GitHub setup is scripted. The repository remains **private** until you review and flip visibility.

Distribution posts (HN, Reddit, social, directories) are **ready to copy** but should be published **after** you make the repo public.

### Status: **READY FOR YOU TO FLIP PUBLIC**

Then publish distribution posts and update TrustMRR.

---

## Completed in this session

| Item | Status |
| --- | --- |
| Secret / OSS validation | Pass |
| Launch blog article | `/blog/fajita-is-now-open-source` in codebase |
| OSS pages on production | Live (`/open-source`, `/self-host`) |
| Maintenance mode docs | Created |
| Launch posts (HN, Reddit, social, PH) | [LAUNCH_POSTS.md](./LAUNCH_POSTS.md) |
| Directory submissions | [submissions/](./submissions/) |
| TrustMRR copy | [TRUSTMRR_UPDATE_DRAFT.md](./TRUSTMRR_UPDATE_DRAFT.md) |
| GitHub setup script | `npm run github:launch-setup` |
| Execution guide | [LAUNCH_EXECUTION.md](./LAUNCH_EXECUTION.md) |
| `v0.1.0` tag on remote | Yes |

## Waiting on you

| Item | Action |
| --- | --- |
| Review private repo | GitHub UI |
| GitHub metadata + labels + issues | `GITHUB_TOKEN=... npm run github:launch-setup` |
| Social preview + Discussions | Manual in GitHub Settings |
| **Make repo public** | Settings → Danger Zone |
| Verify Release + GHCR | After public |
| Post HN / Reddit / social / PH | [LAUNCH_POSTS.md](./LAUNCH_POSTS.md) |
| Directory PRs | [submissions/](./submissions/) |
| TrustMRR update | [TRUSTMRR_UPDATE_DRAFT.md](./TRUSTMRR_UPDATE_DRAFT.md) |

## GitHub API note

Accomplish-Labs org blocks PATs with lifetime >366 days. Shorten token lifetime if `github:launch-setup` fails with Permission Denied.

---

### READY FOR YOU TO FLIP PUBLIC

After flip + distribution, update status to **FAJITA OSS LAUNCH COMPLETE**.
