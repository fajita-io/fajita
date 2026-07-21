"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { BrandIcon } from "@/components/design-system/icons";
import { BrandButton } from "@/components/design-system/primitives";
import type { GeniusOpenSource } from "@/lib/genius/client";
import {
  feedbackCategoryByValue,
  FEEDBACK_CATEGORIES,
} from "@/lib/genius/categories";
import { GENIUS_DASHBOARD_BRAND } from "@/lib/genius/config";
import {
  dispatchFeedbackClose,
  subscribeFeedbackClose,
  subscribeFeedbackOpen,
  type FeedbackOpenDetail,
} from "@/lib/genius/feedback-events";
import { submitGeniusFeedback } from "@/lib/genius/submit-feedback";
import type { GeniusCategory, GeniusProductContext } from "@/lib/genius/types";

const BODY_MIN = 2;
const BODY_MAX = 2000;

const FOCUSABLE =
  'button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])';

function CategoryIcon({ category }: { category: GeniusCategory }) {
  switch (category) {
    case "idea":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "confusion":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M12 17h.01M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "bug":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M8 6V5a4 4 0 0 1 8 0v1M5 10h14M6 10v5a6 6 0 0 0 12 0v-5M3 13h3M18 13h3M4 18l2-1M20 18l-2-1"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "praise":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 21s-7-4.6-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6C19 16.4 12 21 12 21Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<GeniusOpenSource>("button");
  const [openContext, setOpenContext] = useState<Partial<GeniusProductContext>>();
  const [category, setCategory] = useState<GeniusCategory | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const openedAtRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  const selected = feedbackCategoryByValue(category);

  const resetForm = useCallback(() => {
    setCategory(null);
    setOpenContext(undefined);
    setBody("");
    setError(null);
    setSubmitting(false);
    setSuccess(false);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    resetForm();
    dispatchFeedbackClose();
  }, [resetForm]);

  const handleOpen = useCallback(
    (detail: FeedbackOpenDetail) => {
      resetForm();
      setSource(detail.source);
      setOpenContext(detail.context);
      setCategory(detail.category ?? null);
      openedAtRef.current = Date.now();
      setOpen(true);
    },
    [resetForm],
  );

  useEffect(() => subscribeFeedbackOpen(handleOpen), [handleOpen]);
  useEffect(() => subscribeFeedbackClose(close), [close]);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    document.body.dataset.dialogOpen = "true";

    const panel = panelRef.current;
    const target = panel?.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      delete document.body.dataset.dialogOpen;
      restoreRef.current?.focus?.();
    };
  }, [open, close]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selected || submitting) return;

    const trimmed = body.trim();
    if (trimmed.length < BODY_MIN) {
      setError("Add a little more detail before sending.");
      return;
    }
    if (trimmed.length > BODY_MAX) {
      setError("That is a bit too long. Trim it down a touch.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await submitGeniusFeedback({
      category: selected.value,
      body: trimmed,
      source,
      context: openContext,
      elapsedMs: Date.now() - openedAtRef.current,
    });

    setSubmitting(false);

    if (result.ok) {
      setSuccess(true);
      return;
    }

    setError(result.error);
  }

  if (!open) return null;

  if (success) {
    return (
      <div
        className="fj-dialog__backdrop fj-feedback-dialog__backdrop"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div
          ref={panelRef}
          className="fj-feedback-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="fj-feedback-dialog__success">
            <span className="fj-feedback-dialog__success-icon" aria-hidden>
              <BrandIcon name="check" size={20} />
            </span>
            <h2 id={titleId} className="fj-feedback-dialog__title">
              Signal received.
            </h2>
            <p className="fj-feedback-dialog__sub">
              Your team has the page, the category, and your words.
            </p>
            <BrandButton type="button" onClick={close}>
              Done
            </BrandButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fj-dialog__backdrop fj-feedback-dialog__backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        className="fj-feedback-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="fj-feedback-dialog__head">
          <div className="fj-feedback-dialog__intro">
            <p className="fj-feedback-dialog__eyebrow">{GENIUS_DASHBOARD_BRAND.signalName}</p>
            <h2 id={titleId} className="fj-feedback-dialog__title">
              {GENIUS_DASHBOARD_BRAND.headline}
            </h2>
            <p id={descId} className="fj-feedback-dialog__sub">
              {GENIUS_DASHBOARD_BRAND.subhead}
            </p>
          </div>
          <button
            type="button"
            className="fj-icon-button"
            aria-label="Close feedback dialog"
            onClick={close}
          >
            <BrandIcon name="close" size={16} />
          </button>
        </div>

        <form className="fj-feedback-dialog__form" onSubmit={onSubmit}>
          <div
            className="fj-feedback-dialog__categories"
            role="radiogroup"
            aria-label="What are you reaching out about?"
          >
            {FEEDBACK_CATEGORIES.map((option) => {
              const active = category === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`fj-feedback-dialog__category${active ? " is-selected" : ""}`}
                  onClick={() => {
                    setCategory(option.value);
                    setError(null);
                  }}
                >
                  <span className="fj-feedback-dialog__category-icon" aria-hidden>
                    <CategoryIcon category={option.value} />
                  </span>
                  <span className="fj-feedback-dialog__category-label">{option.label}</span>
                  {active ? (
                    <span className="fj-feedback-dialog__category-check" aria-hidden>
                      <BrandIcon name="check" size={14} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <label className="fj-feedback-dialog__label" htmlFor="fj-feedback-body">
            {selected?.prompt ?? "Describe the thought"}
          </label>
          <textarea
            id="fj-feedback-body"
            className="fj-feedback-dialog__textarea"
            value={body}
            placeholder="A sentence is plenty."
            rows={4}
            maxLength={BODY_MAX}
            onChange={(event) => {
              setBody(event.target.value);
              if (error) setError(null);
            }}
          />

          <div className="fj-feedback-dialog__meta">
            <p className="fj-feedback-dialog__context" role="note">
              <BrandIcon name="support" size={16} />
              <span>
                We include the page you were on so the team has the right context.
              </span>
            </p>
            {body.length > BODY_MAX - 200 ? (
              <span className="fj-feedback-dialog__count">
                {body.length} / {BODY_MAX}
              </span>
            ) : null}
          </div>

          <div className="fj-feedback-dialog__actions">
            <BrandButton type="button" variant="secondary" onClick={close} disabled={submitting}>
              Cancel
            </BrandButton>
            <BrandButton
              type="submit"
              disabled={!selected || submitting || body.trim().length < BODY_MIN}
            >
              {submitting ? "Sending..." : selected?.cta ?? "Send feedback"}
            </BrandButton>
          </div>

          {error ? (
            <p className="fj-feedback-dialog__error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
