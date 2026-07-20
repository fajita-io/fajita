import Link from "next/link";

import { PLANS } from "@/lib/stripe/plans";
import type { DocFrontmatter } from "@/lib/docs/frontmatter";

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Plan and permission requirements, shown near the top of a page. */
export function DocsRequirements({ meta }: { meta: DocFrontmatter }) {
  const badges: { label: string; kind: string }[] = [];

  if (meta.requiredRole) {
    badges.push({ label: `Requires ${titleCase(meta.requiredRole)} or higher`, kind: "role" });
  } else if (meta.requiredPermission) {
    badges.push({ label: `Requires ${meta.requiredPermission}`, kind: "role" });
  }

  if (meta.requiredPlans && meta.requiredPlans.length > 0) {
    const names = meta.requiredPlans.map((id) => PLANS[id]?.name ?? id).join(", ");
    badges.push({ label: `Available on ${names}`, kind: "plan" });
  }

  if (badges.length === 0) return null;

  return (
    <ul className="fj-docs-badges" aria-label="Requirements">
      {badges.map((b) => (
        <li key={b.label} className={`fj-docs-badge fj-docs-badge--${b.kind}`}>
          {b.label}
        </li>
      ))}
    </ul>
  );
}

export function DocsDeprecatedBanner({ meta }: { meta: DocFrontmatter }) {
  if (!meta.deprecated) return null;
  return (
    <div className="fj-docs-deprecated" role="alert">
      <p className="fj-docs-deprecated__label">This page is outdated</p>
      <p>
        This documentation no longer matches current product behavior.
        {meta.replacementSlug ? (
          <>
            {" "}
            See <Link href={`/docs/${meta.replacementSlug}`}>the current page</Link> instead.
          </>
        ) : null}
      </p>
    </div>
  );
}

/** Page byline: difficulty and estimated reading time. */
export function DocsPageMeta({ meta }: { meta: DocFrontmatter }) {
  const parts: string[] = [titleCase(meta.difficulty)];
  if (meta.estimatedTime) parts.push(meta.estimatedTime);
  return (
    <div className="fj-docs-pagemeta">
      <span>{parts.join(" · ")}</span>
    </div>
  );
}

export function DocsPrerequisites({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="fj-docs-prereq">
      <p className="fj-docs-prereq__label">Prerequisites</p>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
