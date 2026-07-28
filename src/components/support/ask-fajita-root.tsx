"use client";

import dynamic from "next/dynamic";

import "@/styles/support.css";

import type { ConversationMode, PageContext } from "@/lib/support/types";

const AskFajitaChat = dynamic(
  () => import("./ask-fajita-chat").then((m) => m.AskFajitaChat),
  {
    ssr: false,
    loading: () => null,
  },
);

/**
 * Lazy-mounted Ask Fajita root. Does not block page render.
 * Not mounted on public status pages, auth-provider pages, or Stripe hosts.
 */
export function AskFajitaRoot({
  mode,
  pageContext,
  suggestedPrompts,
}: {
  mode: ConversationMode;
  pageContext?: PageContext;
  suggestedPrompts: string[];
}) {
  return (
    <>
      <AskFajitaChat
        mode={mode}
        pageContext={pageContext}
        suggestedPrompts={suggestedPrompts}
      />
    </>
  );
}
