# Versioning

Fajita uses [Semantic Versioning 2.0.0](https://semver.org/).

## Format

`MAJOR.MINOR.PATCH`

| Segment | When it increments |
| --- | --- |
| **MAJOR** | Breaking changes to self-host upgrade path, database migrations requiring operator action, or incompatible API/CLI behavior |
| **MINOR** | New features backward compatible with existing deployments |
| **PATCH** | Bug fixes and security patches backward compatible with existing deployments |

## Pre-1.0 policy

Until `1.0.0`, minor versions may include breaking changes for self-hosters if documented in release notes and [UPGRADING.md](../self-hosting/UPGRADING.md). Patch versions should remain safe to apply without schema surprises.

The first public OSS release is planned as **`0.1.0`**, reflecting a complete but early open-source launch rather than inflated maturity.

## Tags and artifacts

- Git tags: `v0.1.0`, `v0.2.0`, etc.
- Docker images published to GHCR on tag push (see [RELEASING.md](./RELEASING.md))
- [CHANGELOG.md](../../CHANGELOG.md) is the human-readable history

## Version sources

- Git tag is the release authority
- `package.json` version should match the tagged release at publish time
- Database schema version is tracked via `public.schema_migrations`

## Related docs

- [Releasing](./RELEASING.md)
- [Upgrading](../self-hosting/UPGRADING.md)
