import { describe, expect, it } from "vitest";

import {
  LIFECYCLE_MESSAGE_KEYS,
  LIFECYCLE_MESSAGES,
} from "../messages";
import { LIFECYCLE_EMAIL_FIXTURES } from "./fixtures";
import { renderLifecycleEmail } from "./templates";

/**
 * Every registered lifecycle message must render from its fixture, with a
 * plain-text alternative, escaped customer content, and no leaked template
 * variables. Customer-facing copy carries no em dashes.
 */

describe("lifecycle email rendering", () => {
  it("has a fixture for every registered message", () => {
    for (const key of LIFECYCLE_MESSAGE_KEYS) {
      expect(
        LIFECYCLE_EMAIL_FIXTURES[key],
        `missing fixture for ${key}`,
      ).toBeDefined();
    }
  });

  for (const key of LIFECYCLE_MESSAGE_KEYS) {
    const definition = LIFECYCLE_MESSAGES[key];

    it(`renders ${key} v${definition.templateVersion} completely`, () => {
      const rendered = renderLifecycleEmail(
        key,
        definition.templateVersion,
        LIFECYCLE_EMAIL_FIXTURES[key],
      );
      expect(rendered, `no renderer for ${key}`).not.toBeNull();
      if (!rendered) return;

      expect(rendered.subject.trim().length).toBeGreaterThan(0);
      expect(rendered.previewText.trim().length).toBeGreaterThan(0);
      expect(rendered.html).toContain("<!doctype html>");
      expect(rendered.html).toContain("https://memo.ly");
      expect(rendered.text).toContain("https://memo.ly");
      expect(rendered.text.trim().length).toBeGreaterThan(0);

      // No leaked template placeholders or stringified absence.
      for (const body of [rendered.subject, rendered.html, rendered.text]) {
        expect(body).not.toMatch(/\bundefined\b/);
        expect(body).not.toMatch(/\bNaN\b/);
        expect(body).not.toContain("[object Object]");
        expect(body).not.toContain("{{");
      }

      // Customer-facing copy: no em dashes, no JavaScript, no forms.
      expect(rendered.subject).not.toContain("\u2014");
      expect(rendered.text).not.toContain("\u2014");
      expect(rendered.html.toLowerCase()).not.toContain("<script");
      expect(rendered.html.toLowerCase()).not.toContain("<form");
    });
  }

  it("returns null for an unknown message key", () => {
    expect(renderLifecycleEmail("nonexistent", 1, {})).toBeNull();
  });

  it("falls back to the current template version for an unknown version", () => {
    const fallback = renderLifecycleEmail(
      "welcome",
      999,
      LIFECYCLE_EMAIL_FIXTURES.welcome,
    );
    const current = renderLifecycleEmail(
      "welcome",
      LIFECYCLE_MESSAGES.welcome.templateVersion,
      LIFECYCLE_EMAIL_FIXTURES.welcome,
    );
    expect(fallback).not.toBeNull();
    expect(fallback!.subject).toBe(current!.subject);
  });

  it("escapes hostile customer content in HTML output", () => {
    const hostile = {
      ...LIFECYCLE_EMAIL_FIXTURES.welcome,
      organization_name: `<script>alert("x")</script> & "quotes"`,
    };
    const rendered = renderLifecycleEmail("welcome", 1, hostile);
    expect(rendered).not.toBeNull();
    expect(rendered!.html).not.toContain("<script>alert");
    expect(rendered!.html).toContain("&lt;script&gt;");
  });

  it("includes a preference footer only for optional message classes", () => {
    const optional = renderLifecycleEmail(
      "setup_reminder",
      LIFECYCLE_MESSAGES.setup_reminder.templateVersion,
      LIFECYCLE_EMAIL_FIXTURES.setup_reminder,
    );
    const required = renderLifecycleEmail(
      "pre_deletion_reminder",
      LIFECYCLE_MESSAGES.pre_deletion_reminder.templateVersion,
      LIFECYCLE_EMAIL_FIXTURES.pre_deletion_reminder,
    );
    expect(optional!.html).toContain("/app/settings/notifications");
    // Required service notices carry the service-message footer instead of a
    // preference link that could suggest they can be disabled.
    expect(required!.html.toLowerCase()).toContain("service message");
    expect(required!.html).not.toContain("/app/settings/notifications");
  });
});
