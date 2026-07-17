-- PostgREST on_conflict=email needs a unique constraint on the column
-- itself; the expression index on lower(email) does not qualify. The API
-- lowercases addresses before insert, so a plain unique constraint keeps
-- the same guarantee.

drop index if exists public.early_access_signups_email_key;

alter table public.early_access_signups
  add constraint early_access_signups_email_key unique (email);
