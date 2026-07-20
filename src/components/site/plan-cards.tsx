import { BrandButtonLink } from "@/components/design-system/primitives";
import { DataFastGoals } from "@/lib/analytics";
import { cta } from "@/lib/site/site-config";
import { publicPlans, pricingConfig } from "@/lib/site/pricing";

const planLines: Record<string, string[]> = {
  starter: [
    "Website, API, SSL, and cron checks",
    "Email alerts when something fails verification",
    "Public status page",
    "30-day uptime history",
  ],
  pro: [
    "Everything in Starter",
    "Fifty monitors and 1-minute checks",
    "Slack, Discord, and webhook alerts",
    "Custom status domain and team seats",
  ],
  business: [
    "Everything in Pro",
    "Unlimited monitors across every product you run",
    "Higher subscriber, status-page, and retention limits",
    "Remove powered-by branding on status email",
  ],
};

/**
 * Plan cards. When pricing is unpublished, dollar amounts stay hidden;
 * the cards still sell plan shape and route to signup.
 */
export function PlanCards() {
  return (
    <div className="fj-plans fj-plans--flush">
      {publicPlans.map((plan) => (
        <div
          key={plan.id}
          className={`fj-plan${plan.highlight ? " fj-plan--highlight" : ""}`}
        >
          <div>
            <h2 className="fj-heading-2 fj-plan__header">
              {plan.name}
            </h2>
            <p className="fj-body-sm fj-plan__audience">
              {plan.audience}
            </p>
          </div>

          <p className="fj-plan__monitors">
            {plan.monitorLimit ?? "Unlimited"}
            <span>monitors</span>
          </p>

          {pricingConfig.published && plan.monthlyUsd !== null ? (
            <p className="fj-heading-2 fj-plan__price">
              ${plan.monthlyUsd}
              <span className="fj-body-sm fj-plan__price-note">
                {" "}
                / month
              </span>
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
            href={cta.primary.href}
            variant={plan.highlight ? "primary" : "secondary"}
            data-fast-goal={DataFastGoals.planSelected}
            data-fast-goal-plan={plan.id}
          >
            {cta.primary.label}
          </BrandButtonLink>
        </div>
      ))}
    </div>
  );
}
