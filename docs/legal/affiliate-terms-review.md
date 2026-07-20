# Affiliate terms review

**Date:** 2026-07-20  
**Owner:** privacy / legal  
**Status:** agreement v2 and privacy notice v2 published

## Audit summary

Hardened `src/lib/legal/affiliate-agreement.ts` and `src/lib/legal/affiliate-privacy.ts`. `AFFILIATE_TERMS_VERSION` and `AFFILIATE_PRIVACY_VERSION` bumped to 2 in `src/lib/affiliates/config.ts`.

### Agreement additions in v2

- Expanded termination and post-closure brand asset obligations
- Publicity and brand use section
- Compliance, records, and export / sanctions section
- Electronic records acknowledgment
- Updated survival cross-references

### Privacy notice additions in v2

- Removed stale "when published" Privacy Policy reference
- Legal bases for EEA / UK
- California rights cross-reference
- Dedicated contact section

### Product alignment verified

- Schedule A matches program version 1 commercial terms (20%, 30-day window, 12-month recurring cap)
- No lifetime commission language
- Refund and dispute reversal language preserved

### Remaining counsel items

- New affiliate applications should record acceptance of version 2 terms and privacy notice
- Material commercial changes still require new `AFFILIATE_PROGRAM_VERSIONS` entry, not legal-doc version alone
