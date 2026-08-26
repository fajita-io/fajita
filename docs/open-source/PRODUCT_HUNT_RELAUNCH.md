# Product Hunt relaunch decision (draft)

Status: **Decision document only. Do not publish until Phase 5.**

## Context

Fajita already has Product Hunt history from the hosted product launch. Open-sourcing is a material product change, not a duplicate v1 launch.

## Options

| Option | Pros | Cons |
| --- | --- | --- |
| Update existing PH product page | Preserves social proof and follower graph | May not trigger algorithmic relaunch boost |
| Ship update / announcement post | Signals OSS without claiming "new product" | Lower peak visibility than full relaunch |
| Full relaunch as new listing | Maximum launch-day attention | PH policy risk; splits history; may confuse existing users |

## Recommendation (engineering default)

**Update the existing Product Hunt product** with:

- New tagline emphasizing open source + verification
- OSS screenshots from `.github/assets/`
- Link to `/open-source` and GitHub
- Maker comment explaining Cloud vs self-host (not a pivot away from Cloud)

Schedule a **Ship update** the same day as GitHub public flip, not a duplicate listing.

## Eligibility check before launch

- [ ] Confirm current PH maker account access
- [ ] Confirm PH policy on open-source relaunches for existing SaaS products
- [ ] Confirm whether prior launch date affects "Product of the Day" eligibility
- [ ] Align timing with HN and blog post (same day, staggered hours)

## Assets needed

- 1270×760 gallery images (dashboard, verification, status page)
- Short maker comment (technical, not hype)
- First comment answering self-host vs Cloud

## Metrics

Track separately from hosted launch:

- GitHub stars (organic, do not display until meaningful)
- `/open-source` visits
- `github_clicked`, `self_host_clicked`, `cloud_from_oss_clicked` analytics goals
- Cloud signup rate vs baseline week

## Not doing

- Duplicate Product Hunt listing without explicit PH approval
- "We're back" spam in unrelated communities
- Countdown timers or fake urgency
