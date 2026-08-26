import { BrandButtonLink } from "@/components/design-system/primitives";
import { DataFastGoals } from "@/lib/analytics";
import {
  OSS_GITHUB_URL,
  ossGitHubVisible,
} from "@/lib/site/oss-config";
import { cta } from "@/lib/site/site-config";

/** External GitHub CTA. Hidden until the repository is public. */
export function GitHubButtonLink({
  label = cta.github.label,
  size,
  variant = "secondary",
  goal = DataFastGoals.githubClicked,
}: {
  label?: string;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "ghost";
  goal?: string;
}) {
  if (!ossGitHubVisible()) return null;

  return (
    <BrandButtonLink
      href={OSS_GITHUB_URL}
      size={size}
      variant={variant}
      target="_blank"
      rel="noopener noreferrer"
      data-fast-goal={goal}
    >
      {label}
      <span aria-hidden="true"> ↗</span>
    </BrandButtonLink>
  );
}
