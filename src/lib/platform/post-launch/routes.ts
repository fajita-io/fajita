/**
 * Phase 19 post-launch command center routes.
 * Integrated into Phase 17 ops nav; does not duplicate revenue/support/etc.
 */

export const POST_LAUNCH_ROUTES = [
  {
    href: "/internal/post-launch/overview",
    label: "Overview",
    slug: "overview",
  },
  {
    href: "/internal/post-launch/cohorts",
    label: "Cohorts",
    slug: "cohorts",
  },
  {
    href: "/internal/post-launch/regressions",
    label: "Regressions",
    slug: "regressions",
  },
  {
    href: "/internal/post-launch/feedback",
    label: "Feedback",
    slug: "feedback",
  },
  {
    href: "/internal/post-launch/bugs",
    label: "Bugs",
    slug: "bugs",
  },
  {
    href: "/internal/post-launch/requests",
    label: "Requests",
    slug: "requests",
  },
  {
    href: "/internal/post-launch/interviews",
    label: "Interviews",
    slug: "interviews",
  },
  {
    href: "/internal/post-launch/experiments",
    label: "Experiments",
    slug: "experiments",
  },
  {
    href: "/internal/post-launch/onboarding",
    label: "Onboarding",
    slug: "onboarding",
  },
  {
    href: "/internal/post-launch/retention",
    label: "Retention",
    slug: "retention",
  },
  {
    href: "/internal/post-launch/churn",
    label: "Churn",
    slug: "churn",
  },
  {
    href: "/internal/post-launch/advocacy",
    label: "Advocacy",
    slug: "advocacy",
  },
  {
    href: "/internal/post-launch/growth",
    label: "Growth",
    slug: "growth",
  },
  {
    href: "/internal/post-launch/reviews",
    label: "Reviews",
    slug: "reviews",
  },
] as const;

export type PostLaunchRouteSlug = (typeof POST_LAUNCH_ROUTES)[number]["slug"];
