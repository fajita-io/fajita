"use client";

import { useEffect, useId, useRef, useState } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import { SUPPORT_COPY, SUPPORT_IDENTITY } from "@/lib/support/copy";
import type {
  ConversationMode,
  PageContext,
  SupportAnswer,
} from "@/lib/support/types";

import { PoweredByPamphlet } from "./powered-by-pamphlet";

type ChatMessage =
  | { id: string; kind: "user"; text: string }
  | {
      id: string;
      kind: "assistant";
      answer: SupportAnswer;
    }
  | { id: string; kind: "system"; text: string };

export function AskFajitaChat({
  mode,
  pageContext,
  suggestedPrompts,
  open: controlledOpen,
  onOpenChange,
  variant = "panel",
}: {
  mode: ConversationMode;
  pageContext?: PageContext;
  suggestedPrompts: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "panel" | "page" | "sheet";
}) {
  const titleId = useId();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    trackGoal(DataFastGoals.supportLauncherViewed, { mode });
    // Mount-only view signal for the launcher surface.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) {
      trackGoal(DataFastGoals.supportLauncherOpened, { mode });
      inputRef.current?.focus();
    }
  }, [open, mode]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, sending]);

  async function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setError(null);
    setDraft("");
    const userId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: userId, kind: "user", text: trimmed }]);
    setSending(true);
    trackGoal(DataFastGoals.supportMessageSubmitted, {
      mode,
      area: pageContext?.productArea ?? "none",
    });

    try {
      const res = await fetch("/api/support/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          mode,
          pageContext,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        answer?: SupportAnswer;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.answer) {
        setError(data.error ?? SUPPORT_COPY.errorState);
        trackGoal(DataFastGoals.supportProviderUnavailable, { mode });
        return;
      }
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), kind: "assistant", answer: data.answer! },
      ]);
      trackGoal(DataFastGoals.supportAnswerDisplayed, {
        mode,
        confidence: data.answer.confidence,
      });
      if (data.answer.offerHandoff) {
        trackGoal(DataFastGoals.supportHandoffOffered, { mode });
      }
      if (data.answer.safetyNotice) {
        trackGoal(DataFastGoals.supportSensitiveWarning, { mode });
      }
    } catch {
      setError(SUPPORT_COPY.errorState);
    } finally {
      setSending(false);
    }
  }

  const greeting =
    mode === "authenticated"
      ? SUPPORT_COPY.authenticatedGreeting
      : SUPPORT_COPY.publicGreeting;

  if (variant !== "page" && !open) {
    return (
      <button
        type="button"
        className="fj-support-launcher"
        aria-haspopup="dialog"
        aria-expanded={false}
        aria-label={SUPPORT_IDENTITY.launcherLabel}
        data-testid="ask-fajita-launcher"
        onClick={() => setOpen(true)}
      >
        <span className="fj-support-launcher__mark" aria-hidden="true" />
        <span className="fj-support-launcher__label">
          {SUPPORT_IDENTITY.launcherLabel}
        </span>
      </button>
    );
  }

  return (
    <div
      className={
        variant === "page"
          ? "fj-support-panel fj-support-panel--page"
          : variant === "sheet"
            ? "fj-support-panel fj-support-panel--sheet"
            : "fj-support-panel"
      }
      role={variant === "page" ? undefined : "dialog"}
      aria-modal={variant === "page" ? undefined : true}
      aria-labelledby={titleId}
      data-testid="ask-fajita-panel"
    >
      <header className="fj-support-panel__header">
        <div>
          <h2 id={titleId} className="fj-support-panel__title">
            {SUPPORT_IDENTITY.name}
          </h2>
          <p className="fj-support-panel__mode">
            {mode === "authenticated" ? "Account support" : "Product support"}
          </p>
        </div>
        {variant !== "page" ? (
          <button
            type="button"
            className="fj-support-panel__close"
            aria-label={SUPPORT_COPY.close}
            onClick={() => {
              setOpen(false);
              trackGoal(DataFastGoals.supportLauncherClosed, { mode });
            }}
          >
            {SUPPORT_COPY.close}
          </button>
        ) : null}
      </header>

      <div className="fj-support-panel__body" ref={listRef}>
        {messages.length === 0 ? (
          <div className="fj-support-empty">
            <p>{greeting}</p>
            <p className="fj-support-empty__note">{SUPPORT_COPY.groundingNote}</p>
            <ul className="fj-support-prompts">
              {suggestedPrompts.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    className="fj-support-prompts__btn"
                    onClick={() => {
                      trackGoal(DataFastGoals.supportPromptSelected, { mode });
                      void submit(prompt);
                    }}
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="fj-support-messages">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`fj-support-msg fj-support-msg--${m.kind}`}
              >
                {m.kind === "user" ? (
                  <>
                    <span className="fj-support-msg__author">You</span>
                    <p>{m.text}</p>
                  </>
                ) : m.kind === "system" ? (
                  <p>{m.text}</p>
                ) : (
                  <AssistantBubble answer={m.answer} />
                )}
              </li>
            ))}
          </ul>
        )}
        {sending ? (
          <p className="fj-support-status" aria-live="polite">
            Answering…
          </p>
        ) : null}
        {error ? (
          <p className="fj-support-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <footer className="fj-support-panel__footer">
        <p className="fj-support-warning">{SUPPORT_COPY.composerWarning}</p>
        <form
          className="fj-support-composer"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(draft);
          }}
        >
          <label className="fj-sr-only" htmlFor={`${titleId}-input`}>
            {SUPPORT_COPY.composerPlaceholder}
          </label>
          <textarea
            id={`${titleId}-input`}
            ref={inputRef}
            className="fj-support-composer__input"
            rows={2}
            value={draft}
            placeholder={SUPPORT_COPY.composerPlaceholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit(draft);
              }
            }}
          />
          <button
            type="submit"
            className="fj-support-composer__send"
            disabled={sending || !draft.trim()}
          >
            Send
          </button>
        </form>
        <PoweredByPamphlet compact />
      </footer>
    </div>
  );
}

function AssistantBubble({ answer }: { answer: SupportAnswer }) {
  return (
    <div>
      <span className="fj-support-msg__author">{SUPPORT_COPY.automatedLabel}</span>
      <p>{answer.directAnswer}</p>
      {answer.explanation ? <p>{answer.explanation}</p> : null}
      {answer.steps && answer.steps.length > 0 ? (
        <ol className="fj-support-steps">
          {answer.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
      {answer.safetyNotice ? (
        <p className="fj-support-safety" role="status">
          {answer.safetyNotice}
        </p>
      ) : null}
      {answer.sources.length > 0 ? (
        <ul className="fj-support-sources">
          {answer.sources.map((s) => (
            <li key={s.sourceId + s.url}>
              <a
                href={s.url}
                onClick={() =>
                  trackGoal(DataFastGoals.supportSourceSelected, {
                    type: s.sourceType,
                  })
                }
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {answer.nextAction ? (
        <p className="fj-support-next">
          <a href={answer.nextAction.href}>{answer.nextAction.label}</a>
        </p>
      ) : null}
      {answer.offerHandoff ? (
        <p className="fj-support-handoff">
          <a
            href="/support#handoff"
            onClick={() => trackGoal(DataFastGoals.supportHandoffRequested)}
          >
            {SUPPORT_COPY.handoffCta}
          </a>
        </p>
      ) : null}
    </div>
  );
}
