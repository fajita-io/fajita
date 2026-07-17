import { ORG_ROLES, can, type Permission } from "@/lib/auth/roles";
import { PLANS, type PlanId } from "@/lib/stripe/plans";

import { callout, h2, p, table, ul } from "../blocks";
import { defineDoc, type DocPage } from "../types";

const REVIEWED = "2026-07-17";
const PRODUCT_VERSION = "2026.07";

/**
 * Customer-facing permission matrix generated from the live permission
 * registry (src/lib/auth/roles.ts) so documentation cannot drift from
 * enforcement. Internal-only permissions are intentionally omitted.
 */
const CUSTOMER_CAPABILITIES: { permission: Permission; label: string }[] = [
  { permission: "org:read", label: "View the organization" },
  { permission: "monitors:manage", label: "Create and edit monitors" },
  { permission: "incidents:manage", label: "Manage incidents" },
  { permission: "status_pages:manage", label: "Build status pages" },
  { permission: "status_pages:publish", label: "Publish status pages" },
  { permission: "maintenance:manage", label: "Schedule maintenance" },
  { permission: "integrations:manage", label: "Manage alert channels and routing" },
  { permission: "members:invite", label: "Invite members" },
  { permission: "members:change_role", label: "Change member roles" },
  { permission: "audit:read", label: "Read the audit log" },
  { permission: "subscribers:read_sensitive", label: "View subscriber addresses" },
  { permission: "billing:manage", label: "Manage billing" },
  { permission: "org:transfer_ownership", label: "Transfer ownership" },
];

const CHECK = "Yes";
const NO = "No";

function permissionMatrix() {
  const headers = ["Capability", ...ORG_ROLES.map((r) => r[0].toUpperCase() + r.slice(1))];
  const rows = CUSTOMER_CAPABILITIES.map((cap) => [
    cap.label,
    ...ORG_ROLES.map((role) => (can(role, cap.permission) ? CHECK : NO)),
  ]);
  return table(headers, rows, "Generated from the live permission registry");
}

function planTable() {
  const rows = (Object.keys(PLANS) as PlanId[]).map((id) => {
    const plan = PLANS[id];
    const limit = plan.monitorLimit === null ? "Unlimited" : String(plan.monitorLimit);
    return [plan.name, limit];
  });
  return table(["Plan", "Monitors"], rows, "Generated from the billing catalog");
}

export const teamsBillingAffiliatePages: DocPage[] = [
  defineDoc({
    meta: {
      category: "teams",
      slug: "teams/roles-and-permissions",
      title: "Roles and permissions",
      description: "The organization roles, what each can do, and how least privilege is enforced server-side.",
      model: "operate",
      pageType: "reference",
      order: 0,
      productArea: ["teams"],
      keywords: ["roles", "permissions", "owner", "admin", "member", "access", "matrix"],
      relatedPages: ["teams/audit-log"],
      lastReviewedAt: REVIEWED,
      owner: "docs-platform",
      reviewers: ["engineering", "security"],
      productVersion: PRODUCT_VERSION,
      searchBoost: 2,
    },
    body: [
      p("Fajita organizations have three roles. Access is enforced on the server, not just hidden in the interface."),
      h2("Roles"),
      table(
        ["Role", "Summary"],
        [
          ["Owner", "Full control, including billing and ownership transfer"],
          ["Admin", "Day-to-day operation: members, integrations, publishing, subscribers"],
          ["Member", "Build and operate monitors and status pages; no billing or member management"],
        ],
      ),
      h2("Permission matrix"),
      permissionMatrix(),
      callout("note", [
        p("Ownership moves only through transfer, never through a role change. This blocks self-promotion."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      category: "teams",
      slug: "teams/audit-log",
      title: "Audit log",
      description: "What the audit log records and who can read it.",
      model: "operate",
      pageType: "reference",
      order: 1,
      productArea: ["teams"],
      requiredPermission: "audit:read",
      keywords: ["audit", "log", "history", "who did what"],
      relatedPages: ["teams/roles-and-permissions"],
      lastReviewedAt: REVIEWED,
      owner: "docs-platform",
      reviewers: ["engineering", "security"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p("The audit log records significant organization actions so admins can see who changed what and when."),
      ul([
        "Member and role changes.",
        "Integration and routing changes.",
        "Status-page publication and subscriber operations.",
      ]),
      p("Reading the audit log requires the `audit:read` permission (Admin or Owner)."),
    ],
  }),

  defineDoc({
    meta: {
      category: "billing",
      slug: "billing/plans",
      title: "Plans and limits",
      description: "The plans, their monitor limits, and how usage limits behave.",
      model: "operate",
      pageType: "reference",
      order: 0,
      productArea: ["billing"],
      keywords: ["plans", "pricing", "starter", "pro", "business", "limits", "monitors"],
      relatedPages: ["billing/usage-limits", "billing/payment-failures"],
      lastReviewedAt: REVIEWED,
      owner: "docs-billing",
      reviewers: ["product", "billing"],
      productVersion: PRODUCT_VERSION,
      searchBoost: 2,
    },
    body: [
      p("Fajita offers three plans. Monitor limits below are generated from the billing catalog."),
      h2("Plans"),
      planTable(),
      callout("note", [
        p("Dollar amounts are shown at checkout and on the pricing page. Fajita does not bill overage; when you reach a limit, you are prompted to change plans."),
      ]),
      h2("Monthly and annual"),
      p("Each plan can be billed monthly or annually. Annual billing shows the full annual total before you confirm."),
    ],
  }),

  defineDoc({
    meta: {
      category: "billing",
      slug: "billing/usage-limits",
      title: "Usage limits",
      description: "What happens when you reach a plan limit, and how to raise it.",
      model: "operate",
      pageType: "concept",
      order: 1,
      productArea: ["billing"],
      keywords: ["usage", "limit reached", "monitor limit", "upgrade"],
      relatedPages: ["billing/plans"],
      lastReviewedAt: REVIEWED,
      owner: "docs-billing",
      reviewers: ["product", "billing"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p("Plans include a monitor limit. When you reach it, Fajita stops you from creating more monitors and explains why."),
      ul([
        "Existing monitors keep running.",
        "You are prompted to change plans to raise the limit.",
        "No overage charges are applied.",
      ]),
    ],
  }),

  defineDoc({
    meta: {
      category: "billing",
      slug: "billing/payment-failures",
      title: "Payment failures",
      description: "How a failed payment is handled, the grace period, and how to recover.",
      model: "operate",
      pageType: "concept",
      order: 2,
      productArea: ["billing"],
      requiredPermission: "billing:manage",
      keywords: ["payment failed", "past due", "grace period", "card declined", "recover"],
      relatedPages: ["billing/plans", "troubleshooting/payment"],
      lastReviewedAt: REVIEWED,
      owner: "docs-billing",
      reviewers: ["product", "billing"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p("If a renewal payment fails, Fajita retries and gives you time to fix it before access changes."),
      ul([
        "The subscription enters a past-due state.",
        "During the grace period, monitoring continues.",
        "Update your payment method to recover. Managing billing requires the `billing:manage` permission (Owner).",
      ]),
      callout("note", [
        p("Payment is handled by Stripe. Fajita never stores full card details."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      category: "affiliates",
      slug: "affiliates/overview",
      title: "Affiliate program",
      description: "How referrals are attributed, when commissions become payable, and the promotion rules.",
      model: "operate",
      pageType: "overview",
      order: 0,
      productArea: ["affiliates"],
      keywords: ["affiliate", "referral", "commission", "payout", "attribution", "disclosure"],
      relatedPages: [],
      lastReviewedAt: REVIEWED,
      owner: "docs-affiliates",
      reviewers: ["product", "legal"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p("The affiliate program pays commissions for customers you refer. Program terms are set in the affiliate agreement."),
      h2("How it works"),
      ul([
        "You apply and, once approved, get referral links.",
        "A referred visitor is attributed to you within the attribution window.",
        "A conversion is a paid subscription confirmed through Stripe.",
        "Commissions become payable after a holding period that accounts for refunds and disputes.",
      ]),
      callout("warning", [
        p("Affiliate promotion must disclose the relationship and follow the prohibited-promotion rules in the agreement. Fajita does not guarantee any level of income."),
      ]),
    ],
  }),
];
