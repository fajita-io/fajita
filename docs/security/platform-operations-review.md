# Platform operations security review

- All `/internal` routes require auth; platform permission for ops data
- `robots.txt` disallows `/internal/`
- Noindex metadata on internal layouts
- Absent from `llms.txt` / `llms-full.txt`
- Step-up for sensitive actions when `FAJITA_ENFORCE_STEP_UP=1`
- No unrestricted impersonation
- No raw SQL, shell, or secret rendering
- Exports scoped and audited

Phase 18 performs final penetration and launch certification.
