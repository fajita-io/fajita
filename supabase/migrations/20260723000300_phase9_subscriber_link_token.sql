-- Phase 9: per-subscriber link-token version for stateless preference/unsubscribe
-- links. Preference and unsubscribe links carry a signed, stateless token bound
-- to (subscriber_id, link_token_version). Bumping the version rotates/revokes
-- all previously issued links for that subscriber without storing raw tokens.
-- Confirmation tokens remain single-use, hashed, and stored (they are not
-- reused across sends).
alter table public.status_page_subscribers
  add column if not exists link_token_version integer not null default 1;
