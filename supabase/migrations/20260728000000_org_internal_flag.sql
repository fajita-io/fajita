-- Mark organizations that must never generate affiliate commission
-- (internal test orgs, Fajita-operated demos). Default false.

alter table public.organizations
  add column if not exists is_internal boolean not null default false;

comment on column public.organizations.is_internal is
  'When true, affiliate commissions are never accrued for this organization.';

create index if not exists organizations_is_internal_idx
  on public.organizations (is_internal)
  where is_internal = true;
