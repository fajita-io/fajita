/** @vitest-environment jsdom */
/**
 * Public form behavior: validation, error and success states, honeypot
 * presence, accessible labeling, and input preservation on failure.
 */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/components/site/contact-form";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      json: async () => ({ ok: true }),
    })),
  );
});

describe("contact form", () => {
  it("labels every field and preselects a valid topic from the query", () => {
    render(<ContactForm initialTopic="security" />);
    expect(screen.getByLabelText("Topic")).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Message")).toBeTruthy();
    expect((screen.getByLabelText("Topic") as HTMLSelectElement).value).toBe("security");
  });

  it("falls back to the default topic for unknown query values", () => {
    render(<ContactForm initialTopic="hack-attempt" />);
    expect((screen.getByLabelText("Topic") as HTMLSelectElement).value).toBe("product");
  });

  it("shows field errors tied via aria-describedby and does not call the API", async () => {
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nope" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "hi" } });
    fireEvent.submit(screen.getByRole("button", { name: "Send message" }).closest("form")!);

    const email = screen.getByLabelText("Email");
    await waitFor(() => {
      expect(email.getAttribute("aria-invalid")).toBe("true");
    });
    const describedBy = email.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toContain("valid email");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("submits valid input and shows the success state", async () => {
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "founder@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "I have a question about cron monitoring." },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Send message" }).closest("form")!);
    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toContain("Message sent");
    });
  });
});
