import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
  title: "Confirm alert email",
};

export default function AlertRecipientLayout({ children }: { children: ReactNode }) {
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
.sub-badge{display:inline-block;font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;background:#eef2ff;color:#3730a3;margin-bottom:16px;}
.sub-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;}
.sub-btn{display:inline-block;padding:11px 20px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;cursor:pointer;border:1px solid transparent;}
.sub-btn--primary{background:#1a1a1a;color:#fff;}
`;
