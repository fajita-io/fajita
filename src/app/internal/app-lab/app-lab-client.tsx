"use client";

import { useState } from "react";

import { BrandButton } from "@/components/design-system/primitives";
import {
  Avatar,
  AvailabilityBadge,
  EmptyState,
  OrgAvatar,
  RoleBadge,
  Skeleton,
} from "@/components/app/ui";
import { ToastProvider, useToast } from "@/components/app/toast";
import { Dialog } from "@/components/app/dialog";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { AccountStateScreen } from "@/components/app/account-state-screen";
import { PreFeatureState } from "@/components/app/pre-feature";

function Lab({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "var(--space-8)" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "var(--space-4)" }}>
        {title}
      </h2>
      <div
        style={{
          padding: "var(--space-5)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-background-primary)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function ToastDemo() {
  const toast = useToast();
  return (
    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
      <BrandButton size="sm" onClick={() => toast.success("Saved. Everything is cool.")}>
        Success toast
      </BrandButton>
      <BrandButton size="sm" variant="secondary" onClick={() => toast.error("That did not save. Try again.")}>
        Error toast
      </BrandButton>
      <BrandButton size="sm" variant="ghost" onClick={() => toast.show("Heads up. This is informational.")}>
        Info toast
      </BrandButton>
    </div>
  );
}

export function AppLabClient() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <ToastProvider>
      <div style={{ maxWidth: "60rem", margin: "0 auto", padding: "var(--space-8) var(--space-6)" }}>
        <p className="fj-avail-badge" style={{ marginBottom: "var(--space-4)" }}>
          Simulated fixtures. No real customer data.
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginBottom: "var(--space-6)" }}>
          App Lab
        </h1>

        <Lab title="Avatars and badges">
          <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center", flexWrap: "wrap" }}>
            <Avatar name="Dana Ruiz" size={40} />
            <Avatar name={null} size={40} />
            <OrgAvatar name="Northwind" size={40} />
            <RoleBadge role="owner" />
            <RoleBadge role="admin" />
            <RoleBadge role="member" />
            <AvailabilityBadge />
          </div>
        </Lab>

        <Lab title="Loading skeletons">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <Skeleton width="14rem" height="1.5rem" />
            <Skeleton height="1rem" />
            <Skeleton width="70%" height="1rem" />
          </div>
        </Lab>

        <Lab title="Empty states">
          <EmptyState
            icon="team"
            title="No pending invitations"
            description="When you invite someone, their invitation shows here until they accept it."
            action={<BrandButton size="sm">Invite a teammate</BrandButton>}
          />
        </Lab>

        <Lab title="Toasts">
          <ToastDemo />
        </Lab>

        <Lab title="Dialogs">
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <BrandButton size="sm" onClick={() => setDialogOpen(true)}>Open dialog</BrandButton>
            <BrandButton size="sm" variant="secondary" className="fj-button--danger" onClick={() => setConfirmOpen(true)}>
              Destructive confirm
            </BrandButton>
          </div>
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Example dialog" description="Focus is trapped and restored. Escape closes.">
            <p className="fj-app-section__desc">Dialog body content goes here.</p>
            <div className="fj-dialog__actions">
              <BrandButton variant="ghost" onClick={() => setDialogOpen(false)}>Close</BrandButton>
            </div>
          </Dialog>
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title="Remove this member?"
            description="They will lose access. You can invite them again later."
            confirmLabel="Remove member"
            destructive
            onConfirm={() => { /* simulated */ }}
          />
        </Lab>

        <Lab title="Roles table">
          <table className="fj-table">
            <thead>
              <tr><th>Member</th><th>Role</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {[
                ["Dana Ruiz", "owner", "dana@northwind.example"],
                ["Sam Okonkwo", "admin", "sam@northwind.example"],
                ["A teammate with a very long display name indeed", "member", "very.long.email.address.for.testing@northwind.example"],
              ].map(([name, role, email]) => (
                <tr key={email}>
                  <td>
                    <div className="fj-member-cell">
                      <Avatar name={name} size={34} />
                      <div>
                        <div className="fj-member-cell__name">{name}</div>
                        <div className="fj-member-cell__email">{email}</div>
                      </div>
                    </div>
                  </td>
                  <td><RoleBadge role={role as "owner" | "admin" | "member"} /></td>
                  <td>3 days ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Lab>

        <Lab title="Pre-feature state">
          <PreFeatureState icon="monitor-http" title="Monitors" what="Watch websites, APIs, certificates, and cron jobs." />
        </Lab>

        <Lab title="Account state screen (suspended)">
          <div style={{ transform: "scale(0.9)", transformOrigin: "top left" }}>
            <AccountStateScreen kind="suspended" />
          </div>
        </Lab>
      </div>
    </ToastProvider>
  );
}
