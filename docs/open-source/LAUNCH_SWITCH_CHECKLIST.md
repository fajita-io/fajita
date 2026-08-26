# Launch switch checklist

Execute in order on OSS launch day. Phase 5 owns execution.

## Pre-flight (same day, before public flip)

1. Confirm legal sign-off complete ([LEGAL_REVIEW_CHECKLIST.md](./LEGAL_REVIEW_CHECKLIST.md))
2. Confirm production secret rotation complete ([SECRET_ROTATION_RUNBOOK.md](./SECRET_ROTATION_RUNBOOK.md))
3. Confirm Git history sanitization audit passed ([GIT_HISTORY_AUDIT.md](./GIT_HISTORY_AUDIT.md))
4. Run `npm run oss:check` and `npm run readiness:secrets` on release commit
5. Manual clean-install following README only (real Clerk test app)

## Repository

6. Apply [REPOSITORY_METADATA.md](./REPOSITORY_METADATA.md) in GitHub Settings
7. Set repository visibility to **public** (`fajita-io/fajita`)
8. Enable GitHub Discussions with categories from [DISCUSSIONS.md](./DISCUSSIONS.md)
9. Confirm README, LICENSE, SECURITY.md render correctly on GitHub
10. Publish git tag `v0.1.0` and GitHub Release (notes from [internal/INITIAL_RELEASE_DRAFT.md](./internal/INITIAL_RELEASE_DRAFT.md))
11. Confirm `release.yml` publishes GHCR images
12. Create good-first issues from [internal/GOOD_FIRST_ISSUES.md](./internal/GOOD_FIRST_ISSUES.md)

## Website (fajita.io)

13. Set `NEXT_PUBLIC_OSS_LAUNCHED=true` in production environment
14. Deploy production build
15. Verify `/open-source` and `/self-host` are indexable (no `noindex`)
16. Verify sitemap includes OSS routes
17. Verify GitHub CTAs resolve (not 404)
18. Verify self-host quickstart commands match [docs/self-hosting/QUICKSTART.md](../self-hosting/QUICKSTART.md)
19. Run broken-link pass on nav, footer, docs, comparisons
20. Submit updated sitemap in Search Console

## Announcements (after site + repo verified)

21. Publish launch blog article ([internal/LAUNCH_BLOG_DRAFT.md](./internal/LAUNCH_BLOG_DRAFT.md))
22. Post Show HN ([internal/HACKER_NEWS_DRAFT.md](./internal/HACKER_NEWS_DRAFT.md))
23. Post tailored Reddit drafts ([internal/REDDIT_DRAFTS.md](./internal/REDDIT_DRAFTS.md))
24. Execute Product Hunt plan ([PRODUCT_HUNT_RELAUNCH.md](./PRODUCT_HUNT_RELAUNCH.md))
25. Post X / LinkedIn drafts ([internal/SOCIAL_DRAFTS.md](./internal/SOCIAL_DRAFTS.md))
26. Submit directory listings using [DIRECTORY_METADATA.md](./DIRECTORY_METADATA.md)

## Post-launch monitoring

27. Watch error rates, signup funnel, and OSS analytics goals
28. Monitor GitHub Issues for install failures
29. Document any hotfix path before promoting additional channels

## Rollback

If a blocker appears after flip:

1. Set `NEXT_PUBLIC_OSS_LAUNCHED=false` to hide OSS CTAs and noindex marketing OSS pages
2. Do **not** re-private the repository once public without a documented incident plan
3. Pause announcement channels until fixed
