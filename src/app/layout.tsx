import type { Metadata } from "next";

import { DataFastScript } from "@/components/analytics/datafast-script";

import "./globals.css";

export const metadata: Metadata = {
  title: "fajita.io",
  description: "fajita.io",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DataFastScript />
        {children}
      </body>
    </html>
  );
}
