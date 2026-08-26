import {
  formatGitHubStarCount,
  getGitHubStarCount,
} from "@/lib/site/github-stars";
import {
  OSS_GITHUB_SLUG,
  OSS_GITHUB_URL,
  ossGitHubVisible,
} from "@/lib/site/oss-config";
import { DataFastGoals } from "@/lib/analytics/goals";

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      width={16}
      height={16}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.18.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.51-1.04 2.18-.82 2.18-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}

export function GitHubStarLinkView({
  starCount,
  className,
}: {
  starCount: number | null;
  className?: string;
}) {
  const countLabel =
    starCount === null ? null : formatGitHubStarCount(starCount);

  return (
    <a
      href={OSS_GITHUB_URL}
      className={["fj-github-star", className].filter(Boolean).join(" ")}
      target="_blank"
      rel="noopener noreferrer"
      data-fast-goal={DataFastGoals.githubClicked}
      aria-label={
        countLabel
          ? `Star ${OSS_GITHUB_SLUG} on GitHub (${countLabel} stars)`
          : `Star ${OSS_GITHUB_SLUG} on GitHub`
      }
    >
      <span className="fj-github-star__main">
        <GitHubMark className="fj-github-star__icon" />
        <span className="fj-github-star__label">Star</span>
      </span>
      {countLabel ? (
        <span className="fj-github-star__count" aria-hidden="true">
          {countLabel}
        </span>
      ) : null}
    </a>
  );
}

/** Compact GitHub star CTA. Hidden until OSS launch when used via header wiring. */
export async function GitHubStarLink({ className }: { className?: string }) {
  if (!ossGitHubVisible()) return null;

  const starCount = await getGitHubStarCount();

  return <GitHubStarLinkView starCount={starCount} className={className} />;
}
