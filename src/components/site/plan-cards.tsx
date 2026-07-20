import { BrandButtonLink } from "@/components/design-system/primitives";
import { DataFastGoals } from "@/lib/analytics";
import { buildSignupUrl } from "@/lib/auth/paid-signup-flow";
import { formatChecksCompact } from "@/lib/billing/check-volume";
import { publicPlans, pricingConfig } from "@/lib/site/pricing";

const planLines: Record<string, string[]> = {
  starter: [
    `${formatChecksCompact(100_000)} checks included every month`,
    "Up to 10 monitors, 5-minute checks",
    "Email alerts and a public status page",
    "30-day uptime history",
  ],
  pro: [
    `${formatChecksCompact(500_000)} checks included every month`,
    "Up to 50 monitors, 1-minute checks",
    "Slack, Discord, and webhook alerts",
    "Custom status domain and team seats",
  ],
  business: [
    `${formatChecksCompact(2_000_000)} checks included every month`,
    "Up to 150 monitors, 1-minute checks",
    "Higher subscriber and retention limits",
    "Remove powered-by branding on status email",
  ],
};

export function PlanCards() {
  return (
    <div className="fj-plans fj-plans--flush">
      {publicPlans.map((plan) => (
        <div
          key={plan.id}
          className={`fj-plan${plan.highlight ? " fj-plan--highlight" : ""}`}
        >
          <div>
            <h2 className="fj-heading-2 fj-plan__header">{plan.name}</h2>
            <p className="fj-body-sm fj-plan__audience">{plan.audience}</p>
          </div>

          <p className="fj-plan__monitors">
            {plan.checksLabel}
            <span>checks / mo</span>
          </p>
          <p className="fj-body-sm" style={{ margin: 0, color: "var(--color-text-muted)" }}>
            Up to {plan.monitorLimit} monitors
          </p>

          {pricingConfig.published && plan.monthlyUsd !== null ? (
            <p className="fj-heading-2 fj-plan__price">
              ${plan.monthlyUsd}
              <span className="fj-body-sm fj-plan__price-note"> / month</span>
            </p>
          ) : (
            <p className="fj-body-sm fj-plan__price-unpublished">
              See pricing on the pricing page.
            </p>
          )}

          <ul className="fj-plan__list">
            {planLines[plan.id].map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <BrandButtonLink
            href={buildSignupUrl(plan.id, "month")}
            variant={plan.highlight ? "primary" : "secondary"}
            data-fast-goal={DataFastGoals.planSelected}
            data-fast-goal-plan={plan.id}
          >
            Create account
          </BrandButtonLink>
        </div>
      ))}
    </div>
  );
}
