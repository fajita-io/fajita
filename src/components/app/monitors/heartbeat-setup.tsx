"use client";

import { useMemo, useState } from "react";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { CodeBlock } from "@/components/design-system/primitives";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { useToast } from "@/components/app/toast";
import {
  createHeartbeatTokenAction,
  revokeHeartbeatTokenAction,
  rotateHeartbeatTokenAction,
} from "@/lib/app/actions/monitors";

export interface HeartbeatTokenInfo {
  id: string;
  maskedLabel: string;
  state: string;
  expectedIntervalSeconds: number;
  gracePeriodSeconds: number;
}

/**
 * One-time heartbeat URL, copy, code examples, and rotation/revocation. The raw
 * token is shown exactly once (on create or rotate) and never again: it is not
 * logged, sent to analytics, or returned by any read. Reusable examples use a
 * placeholder, never the real token.
 */
export function HeartbeatSetup({
  organizationId,
  monitorId,
  token,
  defaultIntervalSeconds = 3600,
  defaultGraceSeconds = 300,
  onChange,
}: {
  organizationId: string;
  monitorId: string;
  token: HeartbeatTokenInfo | null;
  defaultIntervalSeconds?: number;
  defaultGraceSeconds?: number;
  onChange?: () => void;
}) {
  const toast = useToast();
  const [freshUrl, setFreshUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [lang, setLang] = useState<"curl" | "node" | "python" | "actions">("curl");

  const origin = typeof window !== "undefined" ? window.location.origin : "https://app.fajita.io";
  const placeholderUrl = `${origin}/api/heartbeat/YOUR_PING_TOKEN`;
  const exampleUrl = freshUrl ?? placeholderUrl;

  async function generate() {
    setBusy(true);
    const res = await createHeartbeatTokenAction(organizationId, monitorId, {
      expectedIntervalSeconds: defaultIntervalSeconds,
      gracePeriodSeconds: defaultGraceSeconds,
    });
    setBusy(false);
    if (res.ok && res.data) {
      setFreshUrl(`${origin}/api/heartbeat/${res.data.rawToken}`);
      toast.success("Ping URL created. Copy it now.");
      onChange?.();
    } else if (!res.ok) {
      toast.error(res.error);
    }
  }

  const examples = useMemo(() => codeExamples(exampleUrl), [exampleUrl]);

  return (
    <div>
      {freshUrl ? (
        <div>
          <p className="fj-wiz__hint" style={{ marginBottom: "var(--space-2)" }}>
            Copy this URL now. For your security, Fajita shows it once and cannot show it again.
          </p>
          <div className="fj-hb-token">
            <code>{freshUrl}</code>
            <BrandButton
              size="sm"
              variant="secondary"
              onClick={() => {
                navigator.clipboard?.writeText(freshUrl);
                toast.success("Copied.");
              }}
            >
              Copy
            </BrandButton>
          </div>
        </div>
      ) : token ? (
        <div className="fj-secret-row">
          <BrandIcon name="monitor-cron" size={18} />
          <div style={{ flex: 1 }}>
            <div className="fj-secret-row__label">{token.maskedLabel}</div>
            <div className="fj-secret-row__type">
              Ping URL active. The full URL is hidden. Rotate to get a new one.
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="fj-wiz__hint" style={{ marginBottom: "var(--space-3)" }}>
            Generate a private URL, then have your job request it each time it runs. Fajita listens
            for that ping and lets you know if one goes missing.
          </p>
          <BrandButton onClick={generate} disabled={busy}>
            {busy ? "Creating…" : "Generate ping URL"}
          </BrandButton>
        </div>
      )}

      {(freshUrl || token) ? (
        <div style={{ marginTop: "var(--space-5)" }}>
          <div className="fj-code-tabs" role="tablist" aria-label="Ping examples">
            {(["curl", "node", "python", "actions"] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                aria-selected={lang === l}
                className="fj-code-tab"
                data-active={lang === l ? "" : undefined}
                onClick={() => setLang(l)}
              >
                {l === "curl" ? "cURL" : l === "node" ? "Node.js" : l === "python" ? "Python" : "GitHub Actions"}
              </button>
            ))}
          </div>
          <CodeBlock label="Heartbeat ping example">{examples[lang]}</CodeBlock>
          {!freshUrl ? (
            <p className="fj-wiz__hint">
              Replace <code>YOUR_PING_TOKEN</code> with the URL you copied when you created it.
            </p>
          ) : null}
        </div>
      ) : null}

      {token ? (
        <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
          <BrandButton variant="secondary" size="sm" onClick={() => setConfirmRotate(true)}>
            Rotate URL
          </BrandButton>
          <BrandButton
            variant="ghost"
            size="sm"
            className="fj-button--danger"
            onClick={() => setConfirmRevoke(true)}
          >
            Revoke
          </BrandButton>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmRotate}
        onClose={() => setConfirmRotate(false)}
        title="Rotate the ping URL?"
        description="The current URL stops working immediately. Update your job with the new URL Fajita shows you next."
        confirmLabel="Rotate URL"
        onConfirm={async () => {
          if (!token) return;
          const res = await rotateHeartbeatTokenAction(organizationId, token.id);
          if (res.ok && res.data) {
            setFreshUrl(`${origin}/api/heartbeat/${res.data.rawToken}`);
            toast.success("New URL created. Copy it now.");
            onChange?.();
          } else if (!res.ok) {
            throw new Error(res.error);
          }
        }}
      />
      <ConfirmDialog
        open={confirmRevoke}
        onClose={() => setConfirmRevoke(false)}
        title="Revoke the ping URL?"
        description="Fajita stops accepting pings at this URL. You can generate a new one later."
        confirmLabel="Revoke"
        destructive
        onConfirm={async () => {
          if (!token) return;
          const res = await revokeHeartbeatTokenAction(organizationId, token.id);
          if (res.ok) {
            setFreshUrl(null);
            toast.success("Ping URL revoked.");
            onChange?.();
          } else {
            throw new Error(res.error);
          }
        }}
      />
    </div>
  );
}

function codeExamples(url: string): Record<"curl" | "node" | "python" | "actions", string> {
  return {
    curl: `# Add to the end of your scheduled job\ncurl -fsS -m 10 --retry 3 "${url}"`,
    node: `// Call once your job finishes successfully\nawait fetch("${url}");`,
    python: `# Call once your job finishes successfully\nimport urllib.request\nurllib.request.urlopen("${url}", timeout=10)`,
    actions: `# In a GitHub Actions workflow step\n- name: Ping Fajita\n  run: curl -fsS -m 10 --retry 3 "${url}"`,
  };
}
