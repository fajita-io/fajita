import Link from "next/link";

import { BrandIcon } from "@/components/design-system/icons";
import { DeliveryStatusBadge, errorLabel } from "@/components/app/alerts/alert-bits";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import { listDeliveries } from "@/lib/alerts/queries";
import { relativeTime } from "@/lib/incidents/duration";
import { DELIVERY_PENDING_NOTICE } from "@/lib/incidents/copy";

/**
 * Compact alert-delivery summary for an incident. Reads the delivery intents
 * routed for this incident so operators can confirm the right people heard
 * about it. Falls back to the pending notice when alerts are not enabled.
 */
export async function IncidentAlertSummary({
  organizationId,
  incidentId,
}: {
  organizationId: string;
  incidentId: string;
}) {
  const enabled = await isFeatureEnabled("integrations", organizationId);
  if (!enabled) {
    return (
      <p className="fj-inc-notice">
        <BrandIcon name="alert" size={13} /> {DELIVERY_PENDING_NOTICE}
      </p>
    );
  }

  const deliveries = await listDeliveries(organizationId, { incidentId, limit: 5 });
  if (deliveries.length === 0) {
    return (
      <p className="fj-inc-empty-line">
        No alerts routed for this incident yet. Check your{" "}
        <Link href="/app/integrations/rules">routing rules</Link> if you expected one.
      </p>
    );
  }

  return (
    <ul className="fj-delivery-list" role="list">
      {deliveries.map((d) => (
        <li key={d.id} className="fj-delivery-row">
          <Link href={`/app/integrations/deliveries/${d.id}`} className="fj-delivery-row__link">
            <DeliveryStatusBadge status={d.status} />
            <span className="fj-delivery-row__event">{d.channelName ?? d.provider}</span>
            <span className="fj-delivery-row__meta">
              {d.lastErrorCategory ? errorLabel(d.lastErrorCategory) : d.kind === "recovery" ? "Recovery" : "Alert"}
            </span>
            <span className="fj-delivery-row__when">{relativeTime(d.createdAt)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
