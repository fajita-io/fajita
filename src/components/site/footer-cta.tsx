import { BrandButtonLink } from "@/components/design-system/primitives";
import { DataFastGoals } from "@/lib/analytics";
import { cta } from "@/lib/site/site-config";

/** Footer conversion pair with its analytics goal (declarative tracking). */
export function FooterCta() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-3)",
        marginTop: "var(--space-6)",
      }}
    >
      <BrandButtonLink
        href={cta.primary.href}
        data-fast-goal={DataFastGoals.footerCta}
      >
        {cta.primary.label}
      </BrandButtonLink>
      <BrandButtonLink href="/features" variant="secondary">
        Explore features
      </BrandButtonLink>
    </div>
  );
}
