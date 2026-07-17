# Affiliate legal counsel review (internal)

**Date:** 2026-07-17  
**Documents:** Affiliate Program Agreement v1; Affiliate Privacy Notice v1  
**Outcome:** Approved for publication and program open (founder/product legal gate)

This memo records the review that closed the Phase 12 pre-launch legal gate.
It is an internal product/legal readiness review. It is not a licensed attorney
opinion and must not be described as outside counsel advice on any customer
surface.

## Findings and fixes applied

| Issue | Resolution |
| --- | --- |
| Drafts not published; applicants could not read binding terms | Published at `/legal/affiliate-agreement` and `/legal/affiliate-privacy`; hub marked in force |
| Cookie consent overclaim ("will gate before public launch") | Privacy §7 rewritten: consent when mechanism available; attribution may fail without it |
| Infra detail in Privacy §8 (RLS, service-role) | Removed; replaced with access-control language suitable for customers |
| Negative-balance language implied full ledger carry | Agreement §5.4: offset and invoice rights; no claim of automatic carry product |
| Ambiguous "assign to an affiliate" | Clarified as corporate affiliate or successor |
| Missing clickwrap / Schedule A | Added electronic acceptance (§2.4) and Schedule A with Version 1 Program Terms |
| Missing survival | Added §14.7 |
| Program terms labeled provisional | Config `programPublished = true`; label "Launch"; feature stage `public_beta` |

## Residual risks (accepted for launch)

- Site-wide Cookie Notice and consent UI are not yet published; EU/UK visitors may lack a consent gate for the referral cookie.
- General Privacy Policy and Terms of Service remain in preparation; this Notice supplements them.
- Tax withholding ledger and multi-currency are not productized; Agreement permits withholding and USD terms only.
- Income guarantees remain prohibited in claims registry.

## Publication checklist

- [x] Agreement and Privacy Notice text finalized
- [x] Public routes live with metadata
- [x] Legal hub links and status updated
- [x] Apply flow links to both documents
- [x] `programPublished = true`
- [x] Affiliates feature stage advanced to `public_beta`
- [x] Claims registry updated for program and rate disclosures
- [x] Trust evidence register updated

## Version control

- `AFFILIATE_TERMS_VERSION = 1`
- `AFFILIATE_PRIVACY_VERSION = 1`
- Commercial program version 1 effective from 2026-07-17
