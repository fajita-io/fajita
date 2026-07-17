# Internal event model

Typed registry: `src/lib/platform/events/registry.ts`  
Storage: `platform_operational_events`

Every event has type, version, occurred/recorded time, source, actor, optional org/resource refs, correlation/causation/idempotency, and bounded safe metadata (≤4KB). No secrets or customer content.
