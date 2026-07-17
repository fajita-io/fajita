# Status page versions

Route: `/app/status-pages/[id]/versions` (`VersionsManager`). See also `docs/engineering/status-page-versioning.md`.

## What you see

Every publish is listed as an immutable version with its number, timestamp, and author. The currently live version is badged.

## Rollback

With `status_pages:publish`, an operator can roll back to any earlier version. Rollback creates a **new** version based on the old configuration and publishes it, so history stays linear and the live version is never mutated in place. Cache is invalidated and the action is audited.

## Draft vs live

The Overview and Preview clearly distinguish draft configuration from the live published configuration. Editing config updates the draft; publishing promotes it to a new live version.
