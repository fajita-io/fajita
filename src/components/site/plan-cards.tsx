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
 * Plan cards. While pricing is unpublished (pricingConfig.published =
 * false) no dollar amounts render anywhere; the cards sell the shape of
 * each plan and route to early access. Amounts appear automatically once
 * the central config publishes them.
 */
export function PlanCards() {
  return (
    <div className="fj-plans" style={{ marginTop: 0 }}>
      {publicPlans.map((plan) => (
        <div
          key={plan.id}
          className={`fj-plan${plan.highlight ? " fj-plan--highlight" : ""}`}
        >
          <div>
            <h2 className="fj-heading-2" style={{ margin: 0 }}>
              {plan.name}
            </h2>
            <p className="fj-body-sm" style={{ margin: "var(--space-2) 0 0" }}>
              {plan.audience}
            </p>
          </div>

          <p className="fj-plan__monitors">
            {plan.monitorLimit ?? "Unlimited"}
            <span>monitors</span>
          </p>

          {pricingConfig.published && plan.monthlyUsd !== null ? (
            <p className="fj-heading-2" style={{ margin: 0 }}>
              ${plan.monthlyUsd}
              <span className="fj-body-sm" style={{ color: "var(--color-text-muted)" }}>
                {" "}
                / month
              </span>
            </p>
          ) : (
            <p className="fj-body-sm" style={{ margin: 0, color: "var(--color-text-muted)" }}>
              Pricing publishes when accounts open.
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
