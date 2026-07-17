import type { BrandIconName } from "@/components/design-system/icons";
import type { FeatureKey, FeatureMap } from "./feature-flags";
import type { Permission } from "@/lib/auth/roles";

export interface NavItem {
  label: string;
  href: string;
  icon: BrandIconName;
  /** Feature flag gating this destination, if any. */
  feature?: FeatureKey;
  /** Permission required to see the item, if any. */
  permission?: Permission;
  /** External link (opens the marketing site / status). */
  external?: boolean;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

/** The full navigation model, before gating. */
const PRIMARY: NavItem[] = [
  { label: "Overview", href: "/app", icon: "overview" },
  { label: "Monitors", href: "/app/monitors", icon: "monitor-http", feature: "monitors" },
  { label: "Monitor groups", href: "/app/monitor-groups", icon: "region", feature: "monitors" },
  { label: "Incidents", href: "/app/incidents", icon: "incident", feature: "incidents" },
  { label: "Status Pages", href: "/app/status-pages", icon: "status-page", feature: "statusPages" },
  { label: "Integrations", href: "/app/integrations", icon: "webhook", feature: "integrations" },
  { label: "Reports", href: "/app/reports", icon: "uptime", feature: "reports" },
];

const ORGANIZATION: NavItem[] = [
  { label: "Maintenance", href: "/app/maintenance", icon: "maintenance", feature: "maintenance" },
  { label: "Team", href: "/app/team", icon: "team", permission: "members:read" },
  { label: "Settings", href: "/app/settings", icon: "settings" },
];

const UTILITY: NavItem[] = [
  { label: "Referrals", href: "/app/referrals", icon: "team" },
  { label: "Support", href: "/app/support", icon: "support" },
  { label: "Service status", href: "/status", icon: "status-page", external: true },
];

interface GateInput {
  features: FeatureMap;
  permissions: Permission[];
  isPlatformAdmin: boolean;
}

function keepItem(item: NavItem, gate: GateInput): boolean {
  if (item.permission && !gate.permissions.includes(item.permission)) {
    return false;
  }
  if (item.feature) {
    // Available features show for everyone. Unavailable product features are
    // hidden from customers and shown only to platform admins (as Planned).
    if (!gate.features[item.feature] && !gate.isPlatformAdmin) return false;
  }
  return true;
}

/** Is this item a planned (not-yet-available) destination for the viewer? */
export function isPlannedItem(item: NavItem, features: FeatureMap): boolean {
  return Boolean(item.feature && !features[item.feature]);
}

export function buildNav(gate: GateInput): NavGroup[] {
  return [
    { label: null, items: PRIMARY.filter((i) => keepItem(i, gate)) },
    { label: "Organization", items: ORGANIZATION.filter((i) => keepItem(i, gate)) },
    { label: null, items: UTILITY.filter((i) => keepItem(i, gate)) },
  ].filter((group) => group.items.length > 0);
}
