import {
  OpsBreadcrumbs,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
import {
  PostLaunchBlockedBanner,
  PostLaunchLinkedBlockers,
  PostLaunchPrerequisiteTable,
} from "@/components/platform/post-launch-blocked";
import {
  evaluateGuardedAction,
  evaluatePhase19Prerequisites,
  getStabilizationWindow,
  type PostLaunchRouteSlug,
} from "@/lib/platform/post-launch";

const SECTION_COPY: Record<
  PostLaunchRouteSlug,
  { title: string; deck: string; deferredWork: string }
> = {
  overview: {
    title: "Post-launch overview",
    deck: "Stabilize first. Learn from real behavior. Improve one measurable constraint at a time.",
    deferredWork: "Full overview metrics (stability, acquisition, activation, retention, voice, business health)",
  },
  cohorts: {
    title: "Launch cohorts",
    deck: "Launch-specific cohorts with product and pricing version labels.",
    deferredWork: "Cohort registry and comparisons",
  },
  regressions: {
    title: "Launch regressions",
    deck: "Detect metric shifts after deploys, flags, pricing, and onboarding changes.",
    deferredWork: "Regression detection rules",
  },
  feedback: {
    title: "Product feedback",
    deck: "Sanitized feedback registry across support, docs, and research.",
    deferredWork: "Feedback registry",
  },
  bugs: {
    title: "Product bugs",
    deck: "Bug severity, ownership, regression links, and verification.",
    deferredWork: "Bug registry",
  },
  requests: {
    title: "Feature requests",
    deck: "Request deduplication, evidence, and explicit rejection records.",
    deferredWork: "Feature-request registry",
  },
  interviews: {
    title: "Customer interviews",
    deck: "Recruitment, consent, notes, and synthesis. No conferencing platform.",
    deferredWork: "Interview operations",
  },
  experiments: {
    title: "Experiments",
    deck: "Hypothesis, approval, assignment, guardrails, analysis, and rollback.",
    deferredWork: "Experiment registry",
  },
  onboarding: {
    title: "Activation and onboarding",
    deck: "Funnel analysis and setup friction queue.",
    deferredWork: "Activation funnel",
  },
  retention: {
    title: "Retention",
    deck: "Meaningful retained product activity by cohort and segment.",
    deferredWork: "Retention analysis",
  },
  churn: {
    title: "Churn",
    deck: "Voluntary and involuntary churn, optional reasons, win-back eligibility.",
    deferredWork: "Churn analysis",
  },
  advocacy: {
    title: "Customer advocacy",
    deck: "Testimonial and case-study consent. No fabricated praise.",
    deferredWork: "Advocacy consent workflows",
  },
  growth: {
    title: "Growth quality",
    deck: "Organic, content, tool, comparison, and affiliate quality.",
    deferredWork: "Growth-quality analysis",
  },
  reviews: {
    title: "Product reviews",
    deck: "Weekly product review and monthly growth review cadence.",
    deferredWork: "Review generators",
  },
};

export function PostLaunchSectionPage({
  slug,
}: {
  slug: PostLaunchRouteSlug;
}) {
  const copy = SECTION_COPY[slug];
  const result = evaluatePhase19Prerequisites();
  const window = getStabilizationWindow();
  const experimentGuard = evaluateGuardedAction("start_experiment");
  const pricingGuard = evaluateGuardedAction("change_pricing");
  const trafficGuard = evaluateGuardedAction("increase_traffic");
  const onboardingGuard = evaluateGuardedAction("change_onboarding");

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { href: "/internal/post-launch/overview", label: "Post-launch" },
          { label: copy.title },
        ]}
      />
      <OpsPageHeader title={copy.title} deck={copy.deck} />

      <PostLaunchBlockedBanner result={result} window={window} />

      <div className="fj-ops-grid" style={{ marginTop: 16 }}>
        <OpsMetricCard
          label="Authorization"
          value={result.authorizationLabel}
          completeness="complete"
        />
        <OpsMetricCard
          label="Failed critical prerequisites"
          value={result.failedCritical.length}
          completeness="complete"
        />
        <OpsMetricCard
          label="Stabilization"
          value={window.phase}
          completeness="complete"
          meta={window.phaseLabel}
        />
        <OpsMetricCard
          label="Change freeze"
          value={window.changeFreeze ? "on" : "off"}
          completeness="complete"
        />
      </div>

      {slug === "overview" ? (
        <>
          <PostLaunchPrerequisiteTable result={result} />
          <PostLaunchLinkedBlockers result={result} />

          <OpsPanel title="Blocked while unauthorized">
            <ul>
              {result.blockedActions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </OpsPanel>

          <OpsPanel title="Allowed while blocked">
            <ul>
              {result.allowedWhileBlocked.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </OpsPanel>

          <OpsPanel title="Next steps">
            <ol>
              {result.nextSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </OpsPanel>

          <OpsPanel title="Guard decisions (current)">
            <table className="fj-ops-table">
              <thead>
                <tr>
                  <th scope="col">Action</th>
                  <th scope="col">Allowed</th>
                  <th scope="col">Reason</th>
                </tr>
              </thead>
              <tbody>
                {[
                  experimentGuard,
                  onboardingGuard,
                  pricingGuard,
                  trafficGuard,
                ].map((g) => (
                  <tr key={g.action}>
                    <td>
                      <code>{g.action}</code>
                    </td>
                    <td>{g.allowed ? "yes" : "no"}</td>
                    <td>{g.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </OpsPanel>

          <OpsPanel title="Live overview metrics">
            <p className="fj-ops-empty">
              Incomplete. Product stability, acquisition, activation, retention,
              customer voice, and business health panels ship after Phase 19 is
              authorized. Do not display unstable numbers as zero.
            </p>
          </OpsPanel>
        </>
      ) : (
        <>
          <OpsPanel title="Deferred until authorization">
            <p>
              <strong>{copy.deferredWork}</strong> is not implemented while
              Phase 19 is blocked. This route shows the gate so operators do not
              mistake empty dashboards for live data.
            </p>
            <p className="fj-ops-empty" style={{ marginTop: 12 }}>
              Experiments: {experimentGuard.allowed ? "eligible" : "blocked"}.
              Traffic: {trafficGuard.allowed ? "eligible" : "blocked"}. Pricing:{" "}
              {pricingGuard.allowed ? "allowed" : "blocked"}.
            </p>
          </OpsPanel>
          <PostLaunchLinkedBlockers result={result} />
        </>
      )}
    </>
  );
}
