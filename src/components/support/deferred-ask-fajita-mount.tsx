"use client";

import dynamic from "next/dynamic";

import type { ConversationMode, PageContext } from "@/lib/support/types";

const AskFajitaMount = dynamic(
  () =>
    import("@/components/support/ask-fajita-mount").then(
      (m) => m.AskFajitaMount,
    ),
  { ssr: false, loading: () => null },
);

export function DeferredAskFajitaMount({
  mode,
  pageContext,
}: {
  mode: ConversationMode;
  pageContext?: PageContext;
}) {
  return <AskFajitaMount mode={mode} pageContext={pageContext} />;
}
