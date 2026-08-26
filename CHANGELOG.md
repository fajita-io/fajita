# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Open-source repository packaging: README, documentation index, architecture docs, contribution system
- GitHub issue and pull request templates
- Repository screenshot and social preview assets
- Self-hosting privacy and security guides for operators
- OSS CI workflow (`oss-readiness.yml`) with gitleaks, migration bootstrap, Go tests, Compose smoke
- Docker Compose self-hosting stack with Go monitor worker and scheduler sidecar
- AGPL-3.0 license, trademark policy, and contributor covenant

### Changed

- Self-hosted deployment mode with billing and telemetry separation
- README and self-hosting docs consolidated for public release readiness

## [0.1.0] - Unreleased (draft)

Initial open-source release candidate. Tag when legal sign-off and secret rotation are complete.

### Added

- Website, API, SSL, and heartbeat monitoring
- Failure verification before incident escalation
- Incidents, maintenance windows, and status pages
- Slack, Discord, email, and signed webhook alerts
- Docker-based self-hosting path
- Clerk authentication integration

[Unreleased]: https://github.com/fajita-io/fajita/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/fajita-io/fajita/releases/tag/v0.1.0
