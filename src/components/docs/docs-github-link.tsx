import Link from "next/link";

import { OSS_GITHUB_URL, ossGitHubVisible } from "@/lib/site/oss-config";

/** Source repository link for documentation pages. */
export function DocsGithubLink({ docSlug }: { docSlug: string }) {
  if (!ossGitHubVisible()) return null;

  const editUrl = `${OSS_GITHUB_URL}/edit/main/src/lib/docs/content/${docSlug.split("/")[0]}.ts`;

  return (
    <p className="fj-docs-github-link fj-body-sm">
      <Link href={OSS_GITHUB_URL} target="_blank" rel="noopener noreferrer">
        View source on GitHub
      </Link>
      {" · "}
      <Link href={editUrl} target="_blank" rel="noopener noreferrer">
        Edit this page on GitHub
      </Link>
    </p>
  );
}
