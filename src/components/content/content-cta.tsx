import Link from "next/link";

import { DataFastGoals } from "@/lib/analytics/goals";
import { resolveContentCta } from "@/lib/content/cta";
import type { ContentCtaVariant } from "@/lib/content/schema";

export function ContentProductCta({
  variant,
  contentSlug,
}: {
  variant: ContentCtaVariant;
  contentSlug: string;
}) {
  const cta = resolveContentCta(variant);
  if (!cta) return null;

  return (
    <aside className="fj-content-cta" aria-label="Next step">
      <p className="fj-content-cta__body">{cta.body}</p>
      <Link
        href={cta.href}
        className="fj-button fj-button--primary"
        data-fast-goal={DataFastGoals.contentProductCta}
        data-fast-goal-slug={contentSlug}
        data-fast-goal-cta={variant}
      >
        {cta.label}
      </Link>
    </aside>
  );
}
