import type { PlatformPermission } from "./permissions";

export interface NavItem {
  href: string;
  label: string;
  permission?: PlatformPermission;
  children?: NavItem[];
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const INTERNAL_NAV: NavSection[] = [
  {
    id: "command",
    label: "Command",
    items: [
      { href: "/internal/command-center", label: "Command center", permission: "platform.overview.read" },
      { href: "/internal/overview", label: "Executive overview", permission: "platform.scorecards.read" },
      { href: "/internal/operations", label: "Platform health", permission: "platform.overview.read" },
      { href: "/internal/readiness", label: "Production readiness", permission: "platform.scorecards.read" },
      { href: "/internal/launch", label: "Launch control", permission: "platform.overview.read" },
      { href: "/internal/post-launch/overview", label: "Post-launch", permission: "platform.overview.read" },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    items: [
      { href: "/internal/customers", label: "Organizations", permission: "platform.customers.read" },
      { href: "/internal/users", label: "Users", permission: "platform.users.read" },
      { href: "/internal/product/activation", label: "Activation", permission: "platform.product.read" },
      { href: "/internal/product/retention", label: "Retention", permission: "platform.product.read" },
      { href: "/internal/product/usage", label: "Usage", permission: "platform.product.read" },
    ],
  },
  {
    id: "product-ops",
    label: "Product ops",
    items: [
      { href: "/internal/monitoring", label: "Monitoring", permission: "platform.monitoring.read" },
      { href: "/internal/monitoring/workers", label: "Workers", permission: "platform.monitoring.workers.read" },
      { href: "/internal/monitoring/regions", label: "Regions", permission: "platform.monitoring.read" },
      { href: "/internal/monitoring/queues", label: "Queues", permission: "platform.monitoring.read" },
      { href: "/internal/monitoring/checks", label: "Checks", permission: "platform.monitoring.read" },
      { href: "/internal/monitoring/security", label: "Monitor security", permission: "platform.monitoring.security.read" },
      { href: "/internal/incidents", label: "Incidents", permission: "platform.incidents.read" },
      { href: "/internal/alerts", label: "Alerts", permission: "platform.alerts.read" },
      { href: "/internal/status-pages", label: "Status pages", permission: "platform.status_pages.read" },
      { href: "/internal/domains", label: "Domains", permission: "platform.domains.read" },
      { href: "/internal/subscribers", label: "Subscribers", permission: "platform.subscribers.read" },
    ],
  },
  {
    id: "revenue",
    label: "Revenue",
    items: [
      { href: "/internal/revenue", label: "Revenue", permission: "platform.revenue.read" },
      { href: "/internal/revenue/subscriptions", label: "Subscriptions", permission: "platform.subscriptions.read" },
      { href: "/internal/revenue/invoices", label: "Invoices", permission: "platform.revenue.read" },
      { href: "/internal/revenue/recovery", label: "Payment recovery", permission: "platform.revenue.read" },
      { href: "/internal/revenue/refunds", label: "Refunds", permission: "platform.billing.refund_review" },
      { href: "/internal/revenue/reconciliation", label: "Billing reconcile", permission: "platform.billing.reconcile" },
      { href: "/internal/affiliates", label: "Affiliates", permission: "affiliate.directory.read" },
    ],
  },
  {
    id: "scale",
    label: "Controlled scale",
    items: [
      { href: "/internal/scale", label: "Scale home", permission: "scale.overview.read" },
      { href: "/internal/scale/overview", label: "Scale command center", permission: "scale.overview.read" },
      { href: "/internal/scale/readiness", label: "Scale readiness", permission: "scale.readiness.read" },
      { href: "/internal/scale/channels", label: "Channels", permission: "scale.channels.read" },
      { href: "/internal/scale/campaigns", label: "Campaigns", permission: "scale.campaigns.read" },
      { href: "/internal/scale/listings", label: "Listings", permission: "scale.channels.read" },
      { href: "/internal/scale/content-compounding", label: "Content compounding", permission: "scale.channels.read" },
      { href: "/internal/scale/affiliates", label: "Affiliate scale", permission: "scale.channels.read" },
      { href: "/internal/scale/referrals", label: "Referrals", permission: "scale.referrals.read" },
      { href: "/internal/scale/partners", label: "Partners", permission: "scale.partners.read" },
      { href: "/internal/scale/expansion", label: "Expansion", permission: "scale.overview.read" },
      { href: "/internal/scale/capacity", label: "Capacity", permission: "scale.capacity.read" },
      { href: "/internal/scale/providers", label: "Provider capacity", permission: "scale.capacity.read" },
      { href: "/internal/scale/costs", label: "Channel costs", permission: "scale.overview.read" },
      { href: "/internal/scale/forecast", label: "Forecast", permission: "scale.forecast.read" },
      { href: "/internal/scale/hiring", label: "Hiring triggers", permission: "scale.hiring.read" },
      { href: "/internal/scale/risks", label: "Scale risks", permission: "scale.overview.read" },
      { href: "/internal/scale/reviews", label: "Scale reviews", permission: "scale.overview.read" },
      { href: "/internal/scale/founder-content", label: "Founder content", permission: "scale.channels.read" },
    ],
  },
  {
    id: "growth",
    label: "Support & content",
    items: [
      { href: "/internal/support", label: "Support", permission: "platform.support.read" },
      { href: "/internal/content", label: "Content", permission: "platform.content.read" },
      { href: "/internal/docs", label: "Documentation", permission: "platform.content.read" },
      { href: "/internal/glossary", label: "Glossary", permission: "platform.content.read" },
      { href: "/internal/seo", label: "SEO & AI visibility", permission: "platform.seo.read" },
      { href: "/internal/product/claims", label: "Claims consistency", permission: "platform.claims.read" },
      { href: "/internal/product/entitlements", label: "Entitlements", permission: "platform.entitlements.read" },
      { href: "/internal/lifecycle", label: "Lifecycle", permission: "platform.product.read" },
    ],
  },
  {
    id: "trust",
    label: "Trust",
    items: [
      { href: "/internal/security", label: "Security", permission: "platform.security.read" },
      { href: "/internal/privacy", label: "Privacy", permission: "platform.privacy.read" },
      { href: "/internal/audit", label: "Audit", permission: "platform.audit.read" },
      { href: "/internal/approvals", label: "Approvals", permission: "platform.approvals.read" },
      { href: "/internal/feature-flags", label: "Feature flags", permission: "platform.flags.read" },
    ],
  },
  {
    id: "infra",
    label: "Infrastructure",
    items: [
      { href: "/internal/providers", label: "Providers", permission: "platform.providers.read" },
      { href: "/internal/releases", label: "Releases", permission: "platform.releases.read" },
      { href: "/internal/infrastructure", label: "Inventory", permission: "platform.infrastructure.read" },
      { href: "/internal/costs", label: "Costs", permission: "platform.costs.read" },
      { href: "/internal/reconciliation", label: "Reconciliation", permission: "platform.reconciliation.read" },
    ],
  },
  {
    id: "planning",
    label: "Planning",
    items: [
      { href: "/internal/reports", label: "Reports", permission: "platform.reports.read" },
      { href: "/internal/calendar", label: "Calendar", permission: "platform.calendar.read" },
      { href: "/internal/settings", label: "Settings", permission: "platform.settings.read" },
    ],
  },
  {
    id: "labs",
    label: "Labs",
    items: [
      { href: "/internal/scale-lab", label: "Scale lab" },
      { href: "/internal/operations-lab", label: "Operations lab" },
      { href: "/internal/monitor-engine-lab", label: "Monitor engine lab" },
      { href: "/internal/incident-lab", label: "Incident lab" },
      { href: "/internal/status-page-lab", label: "Status page lab" },
      { href: "/internal/onboarding-lab", label: "Onboarding lab" },
      { href: "/internal/affiliate-lab", label: "Affiliate lab" },
      { href: "/internal/support-lab", label: "Support lab" },
      { href: "/internal/content-lab", label: "Content lab" },
      { href: "/internal/glossary-lab", label: "Glossary lab" },
      { href: "/internal/brand-lab", label: "Brand lab" },
      { href: "/internal/app-lab", label: "App lab" },
    ],
  },
];

export const COMMAND_PALETTE_ITEMS: Array<{
  id: string;
  label: string;
  href: string;
  keywords: string[];
  permission?: PlatformPermission;
}> = [
  { id: "cc", label: "Open Command Center", href: "/internal/command-center", keywords: ["home", "overview"] },
  { id: "ready", label: "Open Production Readiness", href: "/internal/readiness", keywords: ["gate", "scorecard", "launch"], permission: "platform.scorecards.read" },
  { id: "launch", label: "Open Launch Control", href: "/internal/launch", keywords: ["go live", "stage", "stop"], permission: "platform.overview.read" },
  { id: "scale", label: "Open Scale Command Center", href: "/internal/scale/overview", keywords: ["growth", "cac", "channel"], permission: "scale.overview.read" },
  { id: "scale-ready", label: "Open Scale Readiness", href: "/internal/scale/readiness", keywords: ["scale gate", "blocked"], permission: "scale.readiness.read" },
  { id: "postlaunch", label: "Open Post-launch", href: "/internal/post-launch/overview", keywords: ["phase 19", "stabilization", "experiments", "growth"], permission: "platform.overview.read" },
  { id: "org", label: "Find Organization", href: "/internal/customers", keywords: ["customer", "search"] },
  { id: "mon", label: "Find Monitor", href: "/internal/monitoring/checks", keywords: ["check"] },
  { id: "inc", label: "Find Incident", href: "/internal/incidents", keywords: ["outage"] },
  { id: "rev", label: "Open Revenue", href: "/internal/revenue", keywords: ["mrr", "arr"], permission: "platform.revenue.read" },
  { id: "prov", label: "Open Provider Health", href: "/internal/providers", keywords: ["stripe", "resend"] },
  { id: "appr", label: "Open Approval Queue", href: "/internal/approvals", keywords: ["approve"] },
  { id: "recon", label: "Open Reconciliation", href: "/internal/reconciliation", keywords: ["diff"] },
  { id: "week", label: "Generate Weekly Review", href: "/internal/reports?type=weekly", keywords: ["report"], permission: "platform.reports.generate" },
  { id: "month", label: "Generate Monthly Review", href: "/internal/reports?type=monthly", keywords: ["mbr"], permission: "platform.reports.generate" },
  { id: "sec", label: "Review Critical Security Events", href: "/internal/security?severity=critical", keywords: ["security"] },
  { id: "dead", label: "Review Failed Alert Deliveries", href: "/internal/alerts?state=dead_letter", keywords: ["alerts"] },
  { id: "pay", label: "Review Payment Recovery", href: "/internal/revenue/recovery", keywords: ["dunning"] },
  { id: "stall", label: "Review Setup-Stalled Organizations", href: "/internal/customers?health=setup_stalled", keywords: ["onboarding"] },
];
