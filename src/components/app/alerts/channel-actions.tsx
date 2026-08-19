"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { useToast } from "@/components/app/toast";
import {
  activateChannelAction,
  deleteChannelAction,
  pauseChannelAction,
  resumeChannelAction,
  rotateSigningKeyAction,
  setDefaultChannelAction,
  testChannelAction,
  resendRecipientVerificationAction,
} from "@/lib/app/actions/alerts";

export function ChannelActions({
  organizationId,
  channelId,
  status,
  verificationStatus,
  isDefault,
  canManage,
}: {
  organizationId: string;
  channelId: string;
  status: string;
  verificationStatus: string;
  isDefault: boolean;
  canManage: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(success);
        router.refresh();
      } else {
        toast.error(res.error ?? "That did not work.");
      }
    });
  }

  function test() {
    start(async () => {
      const res = await testChannelAction(organizationId, channelId);
      if (res.ok && res.data) {
        if (res.data.ok) toast.success("Test delivered. This channel is ready to route.");
        else toast.error(res.data.summary || "Test failed. See the channel's recent tests below.");
        router.refresh();
      } else {
        toast.error((res.ok ? "" : res.error) ?? "That did not work.");
      }
    });
  }

  if (!canManage) {
    return <p className="fj-field__hint">You have read-only access to alerts. Ask an owner or admin to make changes.</p>;
  }

  const canActivate = verificationStatus === "verified" && (status === "testing" || status === "draft" || status === "paused");
  const canPause = status === "active" || status === "degraded";

  return (
    <div className="fj-chan-actions">
      <BrandButton size="sm" disabled={pending} onClick={test}>
        <BrandIcon name="bell" size={15} /> Send test
      </BrandButton>

      {canActivate ? (
        <BrandButton size="sm" variant="secondary" disabled={pending} onClick={() => run(() => activateChannelAction(organizationId, channelId), "Channel activated.")}>
          Activate
        </BrandButton>
      ) : null}

      {canPause ? (
        <BrandButton size="sm" variant="secondary" disabled={pending} onClick={() => run(() => pauseChannelAction(organizationId, channelId), "Channel paused.")}>
          Pause
        </BrandButton>
      ) : null}

      {status === "paused" ? (
        <BrandButton size="sm" variant="secondary" disabled={pending} onClick={() => run(() => resumeChannelAction(organizationId, channelId), "Channel resumed.")}>
          Resume
        </BrandButton>
      ) : null}

      {!isDefault && status === "active" ? (
        <BrandButton size="sm" variant="ghost" disabled={pending} onClick={() => run(() => setDefaultChannelAction(organizationId, channelId), "Set as default channel.")}>
          Make default
        </BrandButton>
      ) : null}

      {confirmDelete ? (
        <span className="fj-confirm-inline">
          <span>Delete this channel?</span>
          <BrandButton size="sm" variant="ghost" disabled={pending} onClick={() => setConfirmDelete(false)}>
            Keep
          </BrandButton>
          <BrandButton
            size="sm"
            className="fj-button--danger"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const res = await deleteChannelAction(organizationId, channelId);
                if (res.ok) router.push("/app/integrations");
                return res;
              }, "Channel deleted.")
            }
          >
            Delete
          </BrandButton>
        </span>
      ) : (
        <BrandButton size="sm" variant="ghost" disabled={pending} onClick={() => setConfirmDelete(true)}>
          <BrandIcon name="trash" size={15} /> Delete
        </BrandButton>
      )}
    </div>
  );
}

export function RotateSigningKey({
  organizationId,
  channelId,
}: {
  organizationId: string;
  channelId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [secret, setSecret] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  if (secret) {
    return (
      <div className="fj-reveal fj-reveal--inline">
        <p>New signing secret. Copy it now. We store only a hash.</p>
        <div className="fj-secret-box">
          <code>{secret}</code>
        </div>
        <div className="fj-inc-composer__actions">
          <BrandButton size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(secret).then(() => toast.success("Copied."))}>
            Copy
          </BrandButton>
          <BrandButton size="sm" onClick={() => { setSecret(null); router.refresh(); }}>
            Done
          </BrandButton>
        </div>
      </div>
    );
  }

  if (!confirm) {
    return (
      <BrandButton size="sm" variant="secondary" onClick={() => setConfirm(true)}>
        Rotate signing key
      </BrandButton>
    );
  }

  return (
    <span className="fj-confirm-inline">
      <span>Old key stops verifying immediately. Continue?</span>
      <BrandButton size="sm" variant="ghost" disabled={pending} onClick={() => setConfirm(false)}>
        Cancel
      </BrandButton>
      <BrandButton
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await rotateSigningKeyAction(organizationId, channelId);
            if (res.ok && res.data) {
              setSecret(res.data.secret);
              setConfirm(false);
            } else {
              toast.error((res.ok ? "" : res.error) ?? "That did not work.");
            }
          })
        }
      >
        Rotate
      </BrandButton>
    </span>
  );
}

export function ResendRecipientButton({
  organizationId,
  recipientId,
}: {
  organizationId: string;
  recipientId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      className="fj-link-button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await resendRecipientVerificationAction(organizationId, recipientId);
          if (res.ok && res.data?.sent) {
            toast.success("Verification email sent.");
            router.refresh();
          } else if (res.ok) {
            toast.error("Could not send a verification email right now.");
          } else {
            toast.error(res.error ?? "That did not work.");
          }
        })
      }
    >
      {pending ? "Sending…" : "Resend"}
    </button>
  );
}
