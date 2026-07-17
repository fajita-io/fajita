/**
 * Central role and permission model for Fajita organizations.
 *
 * One definition of who-can-do-what. Never scatter `if (role === "admin")`
 * through the app: import `can()` or a `requireOrganizationPermission()` guard.
 * UI hiding is presentation; these permissions are enforced server-side.
 */

export const ORG_ROLES = ["owner", "admin", "member"] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

/** Higher number = more authority. Used for comparisons only. */
const ROLE_RANK: Record<OrgRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

export function roleAtLeast(role: OrgRole, min: OrgRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

/**
 * Every authorization-gated capability in the product. Future product areas
 * (monitors, incidents, status pages, integrations, billing) are declared now
 * so later phases attach behavior without redesigning the model.
 */
export const PERMISSIONS = [
  "org:read",
  "org:update",
  "org:update_slug",
  "org:delete",
  "org:transfer_ownership",
  "members:read",
  "members:invite",
  "members:remove",
  "members:change_role",
  "invitations:read",
  "invitations:manage",
  "audit:read",
  "export:request",
  "billing:manage",
  "monitors:manage",
  "incidents:manage",
  "maintenance:manage",
  "status_pages:manage",
  "status_pages:publish",
  "integrations:manage",
  // Status-page subscribers (Phase 9). Split so ordinary members never see
  // subscriber email addresses: summary is broad, sensitive/manage/suppress/
  // delete/import/export are elevated.
  "subscribers:read_summary",
  "subscribers:read_sensitive",
  "subscribers:manage",
  "subscribers:suppress",
  "subscribers:delete",
  "subscribers:import",
  "subscribers:export",
  "subscribers:delivery_read",
  "subscribers:delivery_retry",
  "subscribers:settings_manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const MEMBER_PERMISSIONS: Permission[] = [
  "org:read",
  "members:read",
  "export:request",
  "monitors:manage",
  "incidents:manage",
  "status_pages:manage",
  // Members may see aggregate subscriber counts and delivery health, never
  // the addresses themselves.
  "subscribers:read_summary",
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MEMBER_PERMISSIONS,
  "org:update",
  "org:update_slug",
  "members:invite",
  "members:remove",
  "members:change_role",
  "invitations:read",
  "invitations:manage",
  "audit:read",
  "integrations:manage",
  // Maintenance windows are an operational, org-level control: admins and
  // owners schedule them. Members can view but not create/cancel.
  "maintenance:manage",
  // Members may build and edit a status page; making it live (and publishing
  // incident/maintenance updates that customers see) is an admin/owner action.
  "status_pages:publish",
  // Subscriber operations. Admins run the day-to-day: view addresses, manage
  // preferences on request, suppress abusive/bouncing addresses, import with
  // consent attestation, export, inspect deliveries, and configure settings.
  "subscribers:read_sensitive",
  "subscribers:manage",
  "subscribers:suppress",
  "subscribers:import",
  "subscribers:export",
  "subscribers:delivery_read",
  "subscribers:delivery_retry",
  "subscribers:settings_manage",
];

const OWNER_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  "org:delete",
  "org:transfer_ownership",
  "billing:manage",
  // Deleting subscriber data is an owner-level, irreversible privacy action.
  "subscribers:delete",
];

const ROLE_PERMISSIONS: Record<OrgRole, ReadonlySet<Permission>> = {
  member: new Set(MEMBER_PERMISSIONS),
  admin: new Set(ADMIN_PERMISSIONS),
  owner: new Set(OWNER_PERMISSIONS),
};

/** Does `role` grant `permission`? Deny by default. */
export function can(role: OrgRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export function permissionsFor(role: OrgRole): Permission[] {
  return [...(ROLE_PERMISSIONS[role] ?? [])];
}

/**
 * Can an actor assign `target` role to someone (or change a member to it)?
 * Owners may assign admin/member. Admins may assign only member. Nobody
 * assigns owner through role change: ownership moves only via transfer. This
 * blocks privilege escalation and self-promotion at the policy layer.
 */
export function canAssignRole(actorRole: OrgRole, target: OrgRole): boolean {
  if (target === "owner") return false;
  if (actorRole === "owner") return target === "admin" || target === "member";
  if (actorRole === "admin") return target === "member";
  return false;
}
