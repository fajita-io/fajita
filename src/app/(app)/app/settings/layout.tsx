import { PageHeader } from "@/components/app/ui";
import { SettingsNav, type SettingsNavItem } from "@/components/app/settings-nav";
import { requireActiveContext } from "@/lib/app/page-context";
import { can, roleAtLeast } from "@/lib/auth/roles";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { membership } = await requireActiveContext();
  const role = membership.role;

  const items: SettingsNavItem[] = [
    { label: "Profile", href: "/app/settings/profile" },
    ...(can(role, "org:update")
      ? [{ label: "Organization", href: "/app/settings/organization" }]
      : []),
    ...(roleAtLeast(role, "admin")
      ? [{ label: "Billing", href: "/app/settings/billing" }]
      : []),
    { label: "Security", href: "/app/settings/security" },
    { label: "Preferences", href: "/app/settings/preferences" },
    { label: "Notifications", href: "/app/settings/notifications" },
    { label: "Data & account", href: "/app/settings/data" },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account, this organization, and how Fajita behaves for you."
      />
      <div className="fj-settings-grid">
        <SettingsNav items={items} />
        <div>{children}</div>
      </div>
    </>
  );
}
