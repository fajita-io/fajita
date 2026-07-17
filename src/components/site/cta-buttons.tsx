import { BrandButtonLink } from "@/components/design-system/primitives";
import { DataFastGoals } from "@/lib/analytics";
import { cta } from "@/lib/site/site-config";

/**
 * The standard conversion pair: one dominant action, one exploration
 * action. `goal` names the analytics event for the primary click
 * (tracked declaratively via data-fast-goal). Server-renderable.
 */
export function CtaButtons({
  goal = DataFastGoals.heroCta,
  secondaryHref = cta.secondary.href,
  secondaryLabel = cta.secondary.label,
}: {
  goal?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="fj-hero__ctas">
      <BrandButtonLink href={cta.primary.href} data-fast-goal={goal}>
        {cta.primary.label}
      </BrandButtonLink>
      <BrandButtonLink href={secondaryHref} variant="secondary">
        {secondaryLabel}
      </BrandButtonLink>
    </div>
  );
}
