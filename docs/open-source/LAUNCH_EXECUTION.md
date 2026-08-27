# Launch execution guide

Everything except **making the repository public** should be runnable from this repo. You review the private repo, flip visibility when ready, then finish distribution.

## Already done (engineering)

- [x] OSS site pages (`/open-source`, `/self-host`) live when `NEXT_PUBLIC_OSS_LAUNCHED=true`
- [x] Launch blog article in codebase (`/blog/fajita-is-now-open-source`)
- [x] Maintenance mode policy documented
- [x] Secret and OSS validation gates pass
- [x] `v0.1.0` tag on remote
- [x] Launch posts drafted ([LAUNCH_POSTS.md](./LAUNCH_POSTS.md))
- [x] Directory submissions prepared ([submissions/](./submissions/))
- [x] TrustMRR copy draft ([TRUSTMRR_UPDATE_DRAFT.md](./TRUSTMRR_UPDATE_DRAFT.md))

## Step 1: Review (you)

1. Read the private repo on GitHub: https://github.com/fajita-io/fajita
2. Confirm LICENSE, SECURITY.md, README, self-host docs
3. Skim [PHASE_5_RELEASE_REPORT.md](./PHASE_5_RELEASE_REPORT.md)

## Step 2: GitHub setup (private OK)

Fix PAT lifetime if needed (org requires ≤366 days): https://github.com/settings/personal-access-tokens

```bash
export GITHUB_TOKEN=ghp_your_token_with_repo_admin
npm run github:launch-setup
```

This applies description, homepage, topics, labels, and 10 seed issues. It does **not** change visibility.

Manual after script:

- Upload `.github/assets/github-social-preview.png` (Settings → Social preview)
- Enable Discussions ([DISCUSSIONS.md](./DISCUSSIONS.md))

## Step 3: Make repository public (you only)

Settings → Danger Zone → Change visibility → Public

Verify logged out:

- README renders
- LICENSE recognized
- Release v0.1.0 visible
- Issues and labels present

## Step 4: Verify containers

```bash
docker pull ghcr.io/fajita-io/fajita-web:v0.1.0
```

If release workflow did not run, push tag or create GitHub Release from `v0.1.0`.

## Step 5: Publish distribution

Copy from [LAUNCH_POSTS.md](./LAUNCH_POSTS.md):

1. Launch blog (should be live after deploy)
2. Show HN
3. Reddit (tailored per sub)
4. X / LinkedIn
5. Product Hunt update
6. Directory submissions ([submissions/DIRECTORY_SUBMISSIONS.md](./submissions/DIRECTORY_SUBMISSIONS.md))
7. awesome-selfhosted PR ([submissions/awesome-selfhosted.md](./submissions/awesome-selfhosted.md))
8. TrustMRR update ([TRUSTMRR_UPDATE_DRAFT.md](./TRUSTMRR_UPDATE_DRAFT.md))

## Step 5: Post-launch

- Monitor GitHub Issues for install failures
- Fill [30_DAY_REVIEW.md](./30_DAY_REVIEW.md) at day 30
- Stay in [MAINTENANCE_MODE.md](./MAINTENANCE_MODE.md) unless reactivation thresholds hit

## Rollback

If something breaks after flip:

1. Set `NEXT_PUBLIC_OSS_LAUNCHED=false` on Vercel (hides OSS nav; noindex OSS pages)
2. Do not re-private without an incident plan
3. Pause announcement channels until fixed
