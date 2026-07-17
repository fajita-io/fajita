-- Phase 9 follow-up: extend the subscriber consent-record event vocabulary.
--
-- The initial event set covered signup, confirmation, import, resubscribe, and
-- preference changes. Unsubscribe and deletion requests are also part of the
-- consent trail (evidence of when and how a subscriber left), so we record them
-- too. Forward-only: widen the CHECK constraint.

alter table public.status_page_subscriber_consent_records
  drop constraint if exists status_page_subscriber_consent_records_event_check;

alter table public.status_page_subscriber_consent_records
  drop constraint if exists status_page_subscriber_consent_records_event_check1;

-- The original inline check constraint has a generated name; drop by discovering
-- it, then add a named one we control going forward.
do $$
declare
  c text;
begin
  select conname into c
  from pg_constraint
  where conrelid = 'public.status_page_subscriber_consent_records'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%event%subscribe_requested%';
  if c is not null then
    execute format(
      'alter table public.status_page_subscriber_consent_records drop constraint %I',
      c
    );
  end if;
end $$;

alter table public.status_page_subscriber_consent_records
  add constraint status_page_subscriber_consent_records_event_check
  check (event in (
    'subscribe_requested', 'confirmed', 'imported', 'resubscribe_requested',
    'preferences_changed', 'unsubscribed', 'deletion_requested'
  ));
