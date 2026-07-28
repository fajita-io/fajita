import { AvailabilityBadge, EmptyState, PageHeader } from "./ui";
import type { BrandIconName } from "@/components/design-system/icons";

/**
 * Internal-only pre-feature state for reserved navigation destinations. Shown
 * only to platform admins (pages notFound for everyone else). It never renders
 * fake monitors, uptime, or incidents.
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
        title="Coming soon"
        description="This area is reserved. There is no placeholder data here. You are seeing this because you are a platform admin."
      />
    </>
  );
}
