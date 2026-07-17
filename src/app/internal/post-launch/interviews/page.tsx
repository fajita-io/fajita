import type { Metadata } from "next";

import { PostLaunchSectionPage } from "@/components/platform/post-launch-section";

export const metadata: Metadata = {
  title: "Interviews",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <PostLaunchSectionPage slug="interviews" />;
}
