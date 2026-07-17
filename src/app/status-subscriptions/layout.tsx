import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Public, passwordless subscriber surfaces: confirm, preferences, unsubscribe,
 * deletion. Always noindex (these carry access tokens in the URL and must never
 * be indexed or leak through referrers). Intentionally minimal and fast: no
 * marketing chrome, no heavy client bundle, no email SDK.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
  title: "Status subscription",
};

export default function StatusSubscriptionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="sub-root">
      <style>{CSS}</style>
      <main className="sub-shell">{children}</main>
    </div>
  );
}

const CSS = `
.sub-root{min-height:100vh;background:#f4f4f5;color:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:flex-start;justify-content:center;padding:48px 16px;}
.sub-shell{width:100%;max-width:560px;}
.sub-card{background:#fff;border:1px solid #e5e5e7;border-radius:14px;padding:32px;box-shadow:0 1px 2px rgba(0,0,0,.04);}
.sub-card h1{font-size:24px;line-height:1.25;margin:0 0 12px;}
.sub-card p{font-size:15px;line-height:1.6;color:#333;margin:0 0 14px;}
.sub-meta{font-size:13px;color:#777;}
.sub-badge{display:inline-block;font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;background:#eef2ff;color:#3730a3;margin-bottom:16px;}
.sub-fieldset{border:0;padding:0;margin:0 0 20px;}
.sub-fieldset legend{font-size:13px;font-weight:600;color:#555;padding:0;margin:0 0 10px;}
.sub-check{display:flex;gap:10px;align-items:flex-start;padding:8px 0;font-size:15px;color:#222;}
.sub-check input{margin-top:3px;width:18px;height:18px;}
.sub-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;}
.sub-btn{display:inline-block;padding:11px 20px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;cursor:pointer;border:1px solid transparent;}
.sub-btn--primary{background:#1a1a1a;color:#fff;}
.sub-btn--danger{background:#fff;color:#b42318;border-color:#f2c4bd;}
.sub-btn--ghost{background:#fff;color:#333;border-color:#d5d5d8;}
.sub-btn:focus-visible{outline:2px solid #4f46e5;outline-offset:2px;}
.sub-note{font-size:13px;color:#777;margin-top:18px;}
.sub-divider{border:0;border-top:1px solid #eee;margin:24px 0;}
.sub-list{margin:0 0 14px;padding:0;list-style:none;}
.sub-list li{font-size:14px;color:#333;padding:4px 0;}
@media (prefers-reduced-motion: no-preference){.sub-btn{transition:background .15s ease,border-color .15s ease;}}
`;
