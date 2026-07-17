"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import {
  addDomainAction,
  removeDomainAction,
  rotateDomainTokenAction,
  setPrimaryDomainAction,
  verifyDomainAction,
} from "@/lib/app/actions/status-pages";
import type { DomainRecord } from "@/lib/status-pages/domains";
import type { DnsInstructions } from "@/lib/status-pages/domain-util";

const VERIFY_LABEL: Record<DomainRecord["verificationStatus"], string> = {
  pending_dns: "Pending DNS",
  verifying: "Verifying",
  verified: "Verified",
  failed: "Failed",
};

const TLS_LABEL: Record<DomainRecord["tlsStatus"], string> = {
  pending: "Pending",
  provisioning: "Provisioning TLS",
  active: "Active",
  renewal_issue: "Renewal issue",
  failed: "Failed",
  removed: "Removed",
};

export function DomainsManager({
  organizationId,
  statusPageId,
  hostedDomain,
  domains,
  canManage,
}: {
  organizationId: string;
  statusPageId: string;
  hostedDomain: string;
  domains: DomainRecord[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [freshInstructions, setFreshInstructions] = useState<Record<string, DnsInstructions>>({});

  const custom = domains.filter((d) => d.kind === "custom");

  function add() {
    setMessage(null);
    const value = newDomain.trim();
    if (!value) return;
    startTransition(async () => {
      const result = await addDomainAction(organizationId, statusPageId, value);
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setFreshInstructions((prev) => ({ ...prev, [result.data!.domainId]: result.data!.instructions }));
      setNewDomain("");
      setMessage({ tone: "success", text: "Domain added. Add the DNS records below, then verify." });
      router.refresh();
    });
  }

  function verify(domainId: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await verifyDomainAction(organizationId, statusPageId, domainId);
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      if (result.data!.status === "verified") {
        setMessage({ tone: "success", text: "Domain verified. TLS is being provisioned." });
      } else {
        setMessage({ tone: "error", text: result.data!.reason ?? "Not verified yet. DNS can take time." });
      }
      router.refresh();
    });
  }

  function rotate(domainId: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await rotateDomainTokenAction(organizationId, statusPageId, domainId);
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setFreshInstructions((prev) => ({ ...prev, [domainId]: result.data!.instructions }));
      setMessage({ tone: "success", text: "New records generated. Update your DNS and verify again." });
    });
  }

  function makePrimary(domainId: string) {
    startTransition(async () => {
      const result = await setPrimaryDomainAction(organizationId, statusPageId, domainId);
      if (!result.ok) setMessage({ tone: "error", text: result.error });
      else router.refresh();
    });
  }

  function remove(domainId: string) {
    if (!confirm("Remove this custom domain? Visitors will fall back to the hosted address.")) return;
    startTransition(async () => {
      const result = await removeDomainAction(organizationId, statusPageId, domainId);
      if (!result.ok) setMessage({ tone: "error", text: result.error });
      else router.refresh();
    });
  }

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      {message ? (
        <div className="fj-sp-alert" data-tone={message.tone} role="status">
          {message.text}
        </div>
      ) : null}

      <section className="fj-app-section">
        <div className="fj-app-section__head">
          <h2 className="fj-app-section__title">Hosted address</h2>
        </div>
        <div className="fj-app-section__body">
          <p style={{ margin: 0 }}>
            Your page is always reachable at <strong>{hostedDomain}</strong> with managed HTTPS. No setup needed.
          </p>
        </div>
      </section>

      <section className="fj-app-section">
        <div className="fj-app-section__head">
          <h2 className="fj-app-section__title">Custom domain</h2>
          <p className="fj-app-section__desc">
            Use a subdomain such as status.yourcompany.com. Apex domains are not supported yet.
          </p>
        </div>
        <div className="fj-app-section__body">
          {canManage ? (
            <div className="fj-sp-field" style={{ marginBottom: "var(--space-4)" }}>
              <label htmlFor="d-new">Add a domain</label>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <input
                  id="d-new"
                  className="fj-sp-input"
                  style={{ flex: "1 1 16rem" }}
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="status.yourcompany.com"
                  inputMode="url"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                <BrandButton type="button" onClick={add} disabled={pending || !newDomain.trim()}>
                  Add domain
                </BrandButton>
              </div>
            </div>
          ) : null}

          {custom.length === 0 ? (
            <p style={{ margin: 0, color: "var(--color-text-muted)" }}>No custom domain connected.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--space-4)" }}>
              {custom.map((d) => {
                const instr = freshInstructions[d.id] ?? d.instructions;
                return (
                  <li key={d.id} className="fj-sp-domain">
                    <div className="fj-sp-domain__head">
                      <div>
                        <strong>{d.domain}</strong>
                        {d.isPrimary ? <span className="fj-sp-badge" data-tone="ok" style={{ marginLeft: 8 }}>Primary</span> : null}
                      </div>
                      <div className="fj-sp-domain__states">
                        <span className="fj-sp-badge" data-tone={d.verificationStatus === "verified" ? "ok" : "warn"}>
                          {VERIFY_LABEL[d.verificationStatus]}
                        </span>
                        <span className="fj-sp-badge" data-tone={d.tlsStatus === "active" ? "ok" : "warn"}>
                          TLS: {TLS_LABEL[d.tlsStatus]}
                        </span>
                      </div>
                    </div>

                    {d.failureReason ? (
                      <p className="fj-sp-domain__note">{d.failureReason}</p>
                    ) : null}

                    {d.verificationStatus !== "verified" ? (
                      <div className="fj-sp-dns">
                        <p className="fj-sp-dns__intro">Add these records at your DNS provider:</p>
                        {instr ? (
                          <>
                            <DnsRow record={instr.cname} />
                            <DnsRow record={instr.txt} />
                          </>
                        ) : (
                          <p className="fj-sp-dns__intro">
                            Records are not shown. Rotate the challenge to generate a fresh set.
                          </p>
                        )}
                        <p className="fj-sp-dns__hint">
                          DNS changes may take time to appear depending on your provider and existing TTL.
                        </p>
                      </div>
                    ) : null}

                    {canManage ? (
                      <div className="fj-sp-domain__actions">
                        {d.verificationStatus !== "verified" ? (
                          <>
                            <BrandButton type="button" onClick={() => verify(d.id)} disabled={pending}>
                              Verify DNS
                            </BrandButton>
                            <BrandButton type="button" variant="secondary" onClick={() => rotate(d.id)} disabled={pending}>
                              Rotate records
                            </BrandButton>
                          </>
                        ) : !d.isPrimary ? (
                          <BrandButton type="button" onClick={() => makePrimary(d.id)} disabled={pending}>
                            Make primary
                          </BrandButton>
                        ) : null}
                        <BrandButton type="button" variant="secondary" onClick={() => remove(d.id)} disabled={pending}>
                          Remove
                        </BrandButton>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function DnsRow({ record }: { record: { host: string; type: string; value: string } }) {
  return (
    <dl className="fj-sp-dns__record">
      <div>
        <dt>Type</dt>
        <dd>{record.type}</dd>
      </div>
      <div>
        <dt>Name</dt>
        <dd><code>{record.host}</code></dd>
      </div>
      <div>
        <dt>Value</dt>
        <dd><code>{record.value}</code></dd>
      </div>
    </dl>
  );
}
