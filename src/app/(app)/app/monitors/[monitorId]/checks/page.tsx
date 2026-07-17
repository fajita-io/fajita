import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandCard } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { ResultBadge } from "@/components/app/monitors/monitor-bits";
import { EmptyState } from "@/components/app/ui";
import { requireMonitorPage, loadMonitorDetail } from "@/lib/app/monitor-page";
import { getCheckDetail, listCheckHistory } from "@/lib/monitoring/queries";
import { formatResponseTime } from "@/lib/monitoring/uptime";
import { absoluteTime, failureExplanation, relativeTime } from "@/lib/monitoring/display";

const RESULT_FILTERS = [
  { value: "", label: "All results" },
  { value: "success", label: "Passed" },
  { value: "failure", label: "Failed" },
  { value: "timed_out", label: "Timed out" },
  { value: "error", label: "Error" },
  { value: "blocked", label: "Blocked" },
];

export default async function ChecksPage({
  params,
  searchParams,
}: {
  params: Promise<{ monitorId: string }>;
  searchParams: Promise<{ result?: string; page?: string; check?: string }>;
}) {
  const { monitorId } = await params;
  const sp = await searchParams;
  const ctx = await requireMonitorPage();
  const monitor = await loadMonitorDetail(ctx.organizationId, monitorId);
  if (!monitor) notFound();

  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const [history, detail] = await Promise.all([
    listCheckHistory(ctx.organizationId, monitorId, {
      result: sp.result || undefined,
      page,
      pageSize: 25,
    }),
    sp.check ? getCheckDetail(ctx.organizationId, sp.check) : Promise.resolve(null),
  ]);

  const base = `/app/monitors/${monitorId}/checks`;
  const totalPages = Math.max(1, Math.ceil(history.total / history.pageSize));

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      {detail ? <CheckDetail detail={detail} closeHref={qs(base, { result: sp.result })} /> : null}

      <div>
        <nav className="fj-tabs" aria-label="Filter by result" style={{ marginBottom: "var(--space-4)" }}>
          {RESULT_FILTERS.map((f) => {
            const active = (sp.result ?? "") === f.value;
            return (
              <Link key={f.value} href={qs(base, { result: f.value || undefined })} className="fj-tab" aria-current={active ? "page" : undefined}>
                {f.label}
              </Link>
            );
          })}
        </nav>

        {history.rows.length === 0 ? (
          <EmptyState
            title="No checks in this view"
            description="When Fajita runs a check for this monitor, it appears here with timing and assertion detail."
          />
        ) : (
          <BrandCard variant="inset" style={{ padding: 0 }}>
            <div className="fj-mon-tablewrap">
              <table className="fj-mon-table">
                <caption className="fj-visually-hidden">Check history</caption>
                <thead>
                  <tr>
                    <th scope="col">Time</th>
                    <th scope="col">Result</th>
                    <th scope="col">Response</th>
                    <th scope="col">Status</th>
                    <th scope="col">Region</th>
                    <th scope="col"><span className="fj-visually-hidden">Detail</span></th>
                  </tr>
                </thead>
                <tbody>
                  {history.rows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <time dateTime={r.checkedAt} title={absoluteTime(r.checkedAt)}>{relativeTime(r.checkedAt)}</time>
                      </td>
                      <td><ResultBadge result={r.status} size="sm" /></td>
                      <td>{formatResponseTime(r.totalMs)}</td>
                      <td>{r.httpStatus ?? "—"}</td>
                      <td>{r.region ?? monitor.region}</td>
                      <td style={{ textAlign: "right" }}>
                        <Link className="fj-link-button" href={qs(base, { result: sp.result, page: String(page), check: r.id })}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BrandCard>
        )}

        {totalPages > 1 ? (
          <nav className="fj-pagination" aria-label="Check history pages">
            <span>Page {page} of {totalPages}</span>
            <span className="fj-pagination__controls">
              {page > 1 ? (
                <Link className="fj-button fj-button--secondary fj-button--sm" href={qs(base, { result: sp.result, page: String(page - 1) })}>Previous</Link>
              ) : null}
              {page < totalPages ? (
                <Link className="fj-button fj-button--secondary fj-button--sm" href={qs(base, { result: sp.result, page: String(page + 1) })}>Next</Link>
              ) : null}
            </span>
          </nav>
        ) : null}
      </div>
    </div>
  );
}

function CheckDetail({
  detail,
  closeHref,
}: {
  detail: NonNullable<Awaited<ReturnType<typeof getCheckDetail>>>;
  closeHref: string;
}) {
  const timings: Array<{ label: string; ms: number | null }> = [
    { label: "DNS", ms: detail.dnsMs },
    { label: "Connect", ms: detail.connectMs },
    { label: "TLS", ms: detail.tlsMs },
    { label: "First byte", ms: detail.ttfbMs },
    { label: "Total", ms: detail.totalMs },
  ];
  const maxMs = Math.max(...timings.map((t) => t.ms ?? 0), 1);

  return (
    <BrandCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-3)" }}>
        <div>
          <h2 className="fj-section-title" style={{ marginBottom: "var(--space-2)" }}>
            Check detail <ResultBadge result={detail.status} size="sm" />
          </h2>
          <p className="fj-wiz__hint" style={{ margin: 0 }}>{absoluteTime(detail.checkedAt)}</p>
        </div>
        <Link className="fj-icon-button" href={closeHref} aria-label="Close check detail">
          <BrandIcon name="close" size={16} />
        </Link>
      </div>

      {detail.status !== "success" ? (
        <p className="fj-form-status fj-form-status--error" role="status" style={{ marginTop: "var(--space-4)" }}>
          {detail.safeErrorMessage ?? failureExplanation(detail.failureCategory, detail.httpStatus)}
        </p>
      ) : null}

      <div className="fj-check-detail" style={{ marginTop: "var(--space-4)" }}>
        <div>
          <h3 className="fj-section-title">Timing</h3>
          <div className="fj-timing-bars">
            {timings.map((t) => (
              <div className="fj-timing-bar" key={t.label}>
                <span>{t.label}</span>
                <span className="fj-timing-bar__track">
                  <span className="fj-timing-bar__fill" style={{ width: `${((t.ms ?? 0) / maxMs) * 100}%` }} />
                </span>
                <span className="fj-timing-bar__val">{formatResponseTime(t.ms)}</span>
              </div>
            ))}
          </div>
        </div>

        {detail.assertions.length > 0 ? (
          <div>
            <h3 className="fj-section-title">Assertions</h3>
            {detail.assertions.map((a, i) => (
              <div className="fj-ck-assert" data-passed={a.passed} key={i}>
                <span className="fj-ck-assert__mark"><BrandIcon name={a.passed ? "check" : "close"} size={14} /></span>
                <div>
                  <div style={{ fontWeight: 500 }}>{a.assertionType.replace(/_/g, " ")}</div>
                  {a.failureReason ? <div className="fj-wiz__hint" style={{ margin: 0 }}>{a.failureReason}</div> : null}
                  {a.actualSummary ? <div className="fj-wiz__hint" style={{ margin: 0 }}>Actual: {a.actualSummary}</div> : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <dl className="fj-review-list">
          <dt>Final destination</dt><dd><code>{detail.finalUrlSafe}</code></dd>
          <dt>Redirects</dt><dd>{detail.redirectCount ?? 0}</dd>
          <dt>Attempts</dt><dd>{detail.attemptCount ?? 1}</dd>
          <dt>Region</dt><dd>{detail.region ?? "—"}</dd>
          {detail.versionNumber ? (<><dt>Version</dt><dd>v{detail.versionNumber}</dd></>) : null}
          {detail.isTest ? (<><dt>Type</dt><dd>Manual test (excluded from uptime)</dd></>) : null}
          {detail.correlationId ? (<><dt>Reference</dt><dd><code>{detail.correlationId}</code></dd></>) : null}
        </dl>
      </div>
    </BrandCard>
  );
}

function qs(base: string, params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `${base}?${s}` : base;
}
