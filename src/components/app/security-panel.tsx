"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { trackGoalOnce } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";

type Status = "enabled" | "available" | "managed" | "planned";

const STATUS_LABEL: Record<Status, string> = {
  enabled: "Enabled",
  available: "Available",
  managed: "Managed by sign-in provider",
  planned: "Planned",
};

const CONTROLS: { title: string; description: string; status: Status }[] = [
  {
    title: "Email verification",
    description: "Your email is verified before you can sign in.",
    status: "enabled",
  },
  {
    title: "Password and passkeys",
    description: "Set and rotate credentials in the secure provider surface.",
    status: "managed",
  },
  {
    title: "Multi-factor authentication",
    description: "Add an authenticator app or SMS factor where supported.",
    status: "available",
  },
  {
    title: "Active sessions",
    description: "See where you are signed in and revoke sessions.",
    status: "managed",
  },
  {
    title: "Step-up verification",
    description: "Reverify identity before high-risk actions like deletion.",
    status: "planned",
  },
];

export function SecurityPanel() {
  const clerk = useClerk();

  useEffect(() => {
    trackGoalOnce(DataFastGoals.securitySettingsViewed);
  }, []);

  return (
    <>
      <ul className="fj-security-list">
        {CONTROLS.map((control) => (
          <li key={control.title} className="fj-security-item">
            <div>
              <div className="fj-security-item__title">{control.title}</div>
              <div className="fj-security-item__desc">{control.description}</div>
            </div>
            <span className={`fj-security-status fj-security-status--${control.status}`}>
              <BrandIcon
                name={control.status === "enabled" ? "check" : control.status === "planned" ? "maintenance" : "shield"}
                size={13}
              />
              {STATUS_LABEL[control.status]}
            </span>
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-5)", flexWrap: "wrap" }}>
        <BrandButton onClick={() => clerk.openUserProfile()}>
          Manage sign-in and security
        </BrandButton>
        <BrandButton variant="secondary" onClick={() => clerk.signOut({ redirectUrl: "/" })}>
          Sign out
        </BrandButton>
      </div>
    </>
  );
}
