-- Phase 12: affiliate engine helpers + program seed.
--
-- Pure SQL helpers used by RLS and by server code. Ownership helpers resolve the
-- current Clerk-authenticated profile to their affiliate row so an affiliate can
-- read only their own data. The ledger balance function is the single source of
-- truth for an affiliate's net commission position (signed cents).

-- Resolve the current caller's affiliate id (null if they are not an affiliate).
create or replace function app.current_affiliate_id()
returns uuid
language sql
stable
as $$
  select id
  from public.affiliates
  where user_id = app.current_profile_id()
  limit 1;
$$;

-- Does the current caller own the given affiliate row?
create or replace function app.owns_affiliate(aff uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.affiliates
    where id = aff
      and user_id = app.current_profile_id()
  );
$$;

-- Short, human-readable anonymous referral reference (e.g. "A8F2C3D9"). Callers
-- retry on the rare unique collision. Never derived from customer identity.
create or replace function app.affiliate_anon_ref()
returns text
language sql
volatile
as $$
  select upper(substr(md5(gen_random_uuid()::text), 1, 8));
$$;

-- Net ledger balance for an affiliate in signed minor units. Positive means the
-- program owes the affiliate; negative means the affiliate carries a debit that
-- future commission offsets. This is the authoritative balance; the app derives
-- "payable" from commission state, and this from the immutable ledger.
create or replace function app.affiliate_ledger_balance(aff uuid)
returns integer
language sql
stable
as $$
  select coalesce(sum(amount_cents), 0)::int
  from public.affiliate_commission_ledger
  where affiliate_id = aff;
$$;

-- Sum of commissions currently in the payable state (available for payout, before
-- adjustments). Used by payout batch generation and dashboard summaries.
create or replace function app.affiliate_payable_cents(aff uuid)
returns integer
language sql
stable
as $$
  select coalesce(sum(commission_amount_cents - reversed_cents), 0)::int
  from public.affiliate_commissions
  where affiliate_id = aff
    and state = 'payable';
$$;

-- ---------------------------------------------------------------------------
-- Seed the program and its first (provisional) version. Mirrors
-- src/lib/affiliates/config.ts. published stays false until founder review.
-- ---------------------------------------------------------------------------
insert into public.affiliate_programs (slug, name, active_version, published)
values ('fajita-affiliate', 'Fajita Affiliate Program', 1, false)
on conflict (slug) do nothing;

insert into public.affiliate_program_versions (program_id, version, label, effective_from, terms)
select
  p.id,
  1,
  'Launch (provisional)',
  date '2026-07-26',
  jsonb_build_object(
    'attributionModel', 'last_touch',
    'attributionWindowDays', 30,
    'commissionType', 'recurring_percentage',
    'commissionRateBps', 2000,
    'recurringEligibilityMonths', 12,
    'commissionHoldingDays', 30,
    'minimumPayoutThresholdCents', 5000,
    'payoutFrequency', 'monthly',
    'currency', 'usd',
    'eligiblePlanKeys', jsonb_build_array('starter', 'pro', 'business'),
    'reapplyCooldownDays', 90,
    'codeReuseCooldownDays', 180,
    'excludeTax', true,
    'excludeRefundedRevenue', true,
    'excludeCredits', true,
    'excludeDisputedRevenue', true,
    'excludeTrialsBeforePaid', true,
    'excludeInternalOrganizations', true,
    'excludeTestModeSubscriptions', true,
    'affiliateCouponsEnabled', false,
    'reactivationResumesCommission', true
  )
from public.affiliate_programs p
where p.slug = 'fajita-affiliate'
on conflict (program_id, version) do nothing;
