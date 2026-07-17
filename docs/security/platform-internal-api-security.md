# Platform internal API security

`/api/internal/platform/run` uses bearer token timing-safe compare. Unset token → 404. Typed jobs only. No public documentation of internal APIs in customer manifests.
