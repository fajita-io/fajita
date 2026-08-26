# Releasing Fajita

Maintainer process for cutting a Fajita release. Do not publish the first public OSS release until [PUBLIC_REPO_CHECKLIST.md](../open-source/PUBLIC_REPO_CHECKLIST.md) passes and legal sign-off is complete.

## Prerequisites

- [ ] `main` is green in CI
- [ ] `npm run pre-release:verify` passes locally
- [ ] [CHANGELOG.md](../../CHANGELOG.md) updated
- [ ] Upgrade notes documented if migrations or env changes exist
- [ ] Security fixes noted in changelog Security section

## Release steps

### 1. Choose version

Follow [VERSIONING.md](./VERSIONING.md). Example: `0.1.0`.

### 2. Update changelog

Move items from `[Unreleased]` to the new version section with date.

### 3. Update package version

Set `version` in `package.json` to match the release (no `-` suffix).

### 4. Run verification

```bash
npm run pre-release:verify
npm run oss:selfhost-check:fast
```

### 5. Commit and tag

```bash
git commit -am "Release v0.1.0"
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

### 6. GitHub release

Create a GitHub Release from the tag using [RELEASE_NOTES_TEMPLATE.md](./RELEASE_NOTES_TEMPLATE.md).

### 7. Container publish

The [release workflow](../../.github/workflows/release.yml) builds and pushes:

- `ghcr.io/accomplish-labs/fajita-io-web`
- `ghcr.io/accomplish-labs/fajita-io-monitor-worker`
- `ghcr.io/accomplish-labs/fajita-io-worker`

Verify images appear in GHCR after the workflow completes.

### 8. Post-release

- Announce when [ANNOUNCEMENT_DRAFT.md](../open-source/internal/ANNOUNCEMENT_DRAFT.md) is approved (Phase 4)
- Monitor issues for upgrade regressions
- Patch with `0.1.1` if critical fixes are needed

## Security releases

- Cherry-pick or fast-track fixes on `main`
- Patch version bump minimum
- Clearly mark Security section in release notes
- Coordinate disclosure timing per [SECURITY.md](../../SECURITY.md)

## Related docs

- [Initial release draft](../open-source/internal/INITIAL_RELEASE_DRAFT.md)
- [Public repo checklist](../open-source/PUBLIC_REPO_CHECKLIST.md)
