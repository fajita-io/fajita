import Link from "next/link";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { DataFastGoals } from "@/lib/analytics";
import { heroCtas } from "@/lib/site/site-config";

/**
 * Homepage and marketing hero CTAs: Cloud primary, GitHub secondary when OSS
 * is launched, optional self-host text link.
 */
export function HeroCtaCluster({
  goal = DataFastGoals.heroCta,
}: {
  goal?: string;
}) {
  const ctas = heroCtas();

  return (
    <div className="fj-hero__ctas">
      <BrandButtonLink href={ctas.primary.href} data-fast-goal={goal}>
        {ctas.primary.label}
      </BrandButtonLink>
      <BrandButtonLink
        href={ctas.secondary.href}
        variant="secondary"
        {...(ctas.secondary.href.startsWith("http")
          ? {
              target: "_blank",
              rel: "noopener noreferrer",
              "data-fast-goal": DataFastGoals.githubClicked,
            }
          : {})}
      >
        {ctas.secondary.label}
        {ctas.secondary.href.startsWith("http") ? (
          <span aria-hidden="true"> ↗</span>
        ) : null}
      </BrandButtonLink>
      {ctas.tertiary ? (
        <Link
          href={ctas.tertiary.href}
          className="fj-body-sm fj-hero__tertiary-link"
          data-fast-goal={DataFastGoals.selfHostClicked}
        >
          {ctas.tertiary.label}
        </Link>
      ) : null}
    </div>
  );
}
