import type { ContentCtaVariant } from "./schema";

export interface ContentCta {
  href: string;
  label: string;
  body: string;
}

export function resolveContentCta(variant: ContentCtaVariant): ContentCta | null {
  switch (variant) {
    case "start-monitoring":
      return {
        href: "/signup",
        label: "Start monitoring",
        body: "Create a monitor and test your endpoint before monitoring begins.",
      };
    case "publish-status-page":
      return {
        href: "/features/status-pages",
        label: "Publish a status page",
        body: "Put a public page in place before the first incident forces the issue.",
      };
    case "create-heartbeat":
      return {
        href: "/features/cron-monitoring",
        label: "Create a heartbeat monitor",
        body: "A cron expression says when a job should run. A heartbeat says whether it did.",
      };
    case "review-documentation":
      return {
        href: "/docs",
        label: "Review documentation",
        body: "Product steps live in the docs. Keep this page for the reasoning.",
      };
    case "use-free-tool":
      return {
        href: "/tools",
        label: "Use a free tool",
        body: "Run the calculation or checklist without creating an account.",
      };
    case "compare-plans":
      return {
        href: "/pricing",
        label: "Compare plans",
        body: "See current Fajita plan limits and pricing.",
      };
    case "none":
      return null;
  }
}
