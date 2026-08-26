import { BrandButtonLink } from "@/components/design-system/primitives";
import { DataFastGoals } from "@/lib/analytics";
import { OSS_ROUTES } from "@/lib/site/oss-config";
import { cta, heroCtas } from "@/lib/site/site-config";

import { GitHubButtonLink } from "./oss/github-button-link";

/** Footer conversion pair with OSS-aware secondary action. */
export function FooterCta() {
  const ctas = heroCtas();

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
      {ctas.secondary.href.startsWith("http") ? (
        <GitHubButtonLink variant="secondary" goal={DataFastGoals.footerCta} />
      ) : (
        <BrandButtonLink href={OSS_ROUTES.openSource} variant="secondary">
          Open source
        </BrandButtonLink>
      )}
    </div>
  );
}
