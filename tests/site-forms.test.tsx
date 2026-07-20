/** @vitest-environment jsdom */
/**
 * Public form behavior: validation, error and success states, honeypot
 * presence, accessible labeling, and input preservation on failure.
 */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/components/site/contact-form";
import { EarlyAccessForm } from "@/components/site/early-access-form";

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

describe("early access form", () => {
  it("labels the email field and includes an aria-hidden honeypot", () => {
    const { container } = render(<EarlyAccessForm source="test" />);
    expect(screen.getByLabelText("Email")).toBeTruthy();
    const honeypot = container.querySelector(".fj-hp");
    expect(honeypot?.getAttribute("aria-hidden")).toBe("true");
    expect(honeypot?.querySelector("input")?.getAttribute("tabindex")).toBe("-1");
  });

  it("rejects an invalid email without calling the API", async () => {
    render(<EarlyAccessForm source="test" />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Get early access" }).closest("form")!);
    expect(await screen.findByText("Enter a valid email address.")).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows the success state after a valid submission", async () => {
    render(<EarlyAccessForm source="test" />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "founder@example.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Get early access" }).closest("form")!);
    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toContain("You are on the list");
    });
  });

  it("keeps input and shows a recoverable error when the API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({ ok: false, error: "That did not save. Try again in a moment." }),
      })),
    );
    render(<EarlyAccessForm source="test" />);
    const input = screen.getByLabelText("Email") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "founder@example.com" } });
    fireEvent.submit(screen.getByRole("button", { name: "Get early access" }).closest("form")!);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
    });
    expect(input.value).toBe("founder@example.com");
  });
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
