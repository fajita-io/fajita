# Export worker (Phase 17)

Export requests are queued in `platform_exports`. Column allowlists and formula
injection sanitization live in `src/lib/platform/exports/service.ts`.

Generation should:

1. Re-check platform permission
2. Apply exact filters from the request row
3. Emit only allowlisted columns
4. Sanitize cells (`sanitizeExportCell`)
5. Store with content hash, watermark, and expiry
6. Audit download events

Never export secrets, payment methods, tax ids, subscriber lists, or raw support bodies.
