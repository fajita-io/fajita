# Support worker

Phase 16 placeholder for support reconciliation and retention jobs.

Until Pamphlet provider APIs are verified, this worker has no outbound provider traffic. Scheduled work can later:

- Expire anonymous conversations
- Reconcile local metadata with Pamphlet
- Process deletion requests

Trigger pattern should match other internal workers (`CRON_SECRET` / bearer token) when implemented in Phase 17.
