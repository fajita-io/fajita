import { AvailabilityBadge, EmptyState, PageHeader } from "./ui";
import type { BrandIconName } from "@/components/design-system/icons";

/**
 * Internal-only pre-feature state for reserved navigation destinations. Shown
 * only to platform admins (pages notFound for everyone else). It never renders
 * fake monitors, uptime, or incidents: it states plainly that the feature lands
 * in a later build.
 */
export function PreFeatureState({
  icon,
  title,
  what,
}: {
  icon: BrandIconName;
  title: string;
  what: string;
}) {
  return (
    <>
      <PageHeader title={title} description={what} actions={<AvailabilityBadge />} />
      <EmptyState
        icon={icon}
        title="Coming in a later build"
        description="This area is reserved. There is no fake data here, and it will light up when the underlying engine ships. You are seeing this because you are a platform admin."
      />
    </>
  );
}
