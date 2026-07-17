# Phase 3 data map (internal)

Data collected to operate the Phase 3 account foundation. Complements the Phase 0 legal data map. Only data needed to run the account is collected.

## Categories

| Data | Source | Purpose | Retention | Access | Deletion | Export |
| --- | --- | --- | --- | --- | --- | --- |
| Authentication (email, password, MFA) | Clerk | Sign-in, identity | Managed by Clerk | Clerk; app sees session + profile mirror | On account deletion via Clerk | Via Clerk |
| Profile (`user_profiles`) | Clerk sync + user edits | Display, preferences | Life of account | Owner (self) | Soft-delete then worker purge | User-scope export |
| Preferences (`user_preferences`, `notification_preferences`) | User | Display/comms behavior | Life of account | Owner (self) | Cascade on profile delete | User-scope export |
| Organization (`organizations`) | Owner/admin | Tenant record | Life of org | Members per role | Scheduled deletion | Org-scope export |
| Membership (`organization_members`) | Owner/admin/invite | Access control | Life of membership | Members of the org | Cascade on org/profile delete | Org-scope export |
| Invitation (`organization_invitations`) | Admin/owner | Onboarding teammates | Until accepted/expired/revoked | Org admins | Cascade on org delete | Org-scope export (no token) |
| Onboarding (`organization_onboarding`) | User answers | Guide setup | Life of org | Members | Cascade | Org-scope export |
| Audit (`audit_events`) | System | Security/accountability | Retention TBD (Phase 0) | Org admins/owner | Cascade with org; user-level with actor | Org-scope export |
| Notifications (`notifications`) | System | In-app messaging | Rolling | Owner (self) | Cascade | User-scope export |
| Export requests (`export_requests`) | User | Data portability | Until expiry | Requester/org admin | Cascade | metadata only |
| Deletion requests (`deletion_requests`) | User/owner | Deletion lifecycle | Until completed/canceled | Subject/owner | Cascade | metadata only |
| Analytics events (DataFast) | App | Product improvement | Per provider | Internal | N/A | N/A |

## Not collected

Phone number, physical address, job title, company revenue, device fingerprinting, standing IP logs, and any monitoring-target data (monitoring does not exist yet). IP/user-agent are not stored in audit events by default; capturing them requires documented legal justification.

## Sensitive-data rules

No passwords, tokens, invitation tokens, secret headers, or full request bodies are stored or logged. Analytics never receives invitation emails, org names, full names, tokens, or secrets.
