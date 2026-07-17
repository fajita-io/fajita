import type { Metadata } from "next";

import { OpsLinkButton } from "@/components/platform/ops-ui";
import { POST_LAUNCH_ROUTES } from "@/lib/platform/post-launch";

export const metadata: Metadata = {
  title: {
    default: "Post-launch",
    template: "%s · Post-launch · Fajita Ops",
  },
  robots: { index: false, follow: false },
};

export default function PostLaunchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav
        aria-label="Post-launch sections"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {POST_LAUNCH_ROUTES.map((route) => (
          <OpsLinkButton key={route.href} href={route.href}>
            {route.label}
          </OpsLinkButton>
        ))}
      </nav>
      {children}
    </>
  );
}
