import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureUserProfile = vi.fn();
const suspendUserProfile = vi.fn();
const unsuspendUserProfile = vi.fn();
const softDeleteUserProfile = vi.fn();
const verifyWebhook = vi.fn();

vi.mock("@/lib/analytics", () => ({
  DataFastGoals: { signup: "signup" },
  trackServerGoal: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth/provisioning", () => ({
  ensureUserProfile,
  suspendUserProfile,
  unsuspendUserProfile,
  softDeleteUserProfile,
}));

vi.mock("@clerk/nextjs/webhooks", () => ({
  verifyWebhook,
}));

describe("POST /api/webhooks/clerk", () => {
  beforeEach(() => {
    vi.resetModules();
    ensureUserProfile.mockReset();
    suspendUserProfile.mockReset();
    unsuspendUserProfile.mockReset();
    softDeleteUserProfile.mockReset();
    verifyWebhook.mockReset();
  });

  it("returns 400 when webhook signature verification fails", async () => {
    verifyWebhook.mockRejectedValue(new Error("bad sig"));
    const { POST } = await import("@/app/api/webhooks/clerk/route");
    const res = await POST(
      new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: "{}",
      }) as never,
    );
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ error: "invalid signature" });
    expect(ensureUserProfile).not.toHaveBeenCalled();
  });

  it("provisions user on user.created", async () => {
    verifyWebhook.mockResolvedValue({
      type: "user.created",
      data: {
        id: "user_abc",
        email_addresses: [{ id: "em_1", email_address: "dev@example.com" }],
        primary_email_address_id: "em_1",
        first_name: "Dev",
        last_name: "User",
        banned: false,
      },
    });
    ensureUserProfile.mockResolvedValue({ id: "profile-1" });

    const { POST } = await import("@/app/api/webhooks/clerk/route");
    const res = await POST(
      new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: "{}",
      }) as never,
    );
    expect(res.status).toBe(200);
    expect(ensureUserProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user_abc",
        primaryEmail: "dev@example.com",
      }),
    );
    expect(unsuspendUserProfile).toHaveBeenCalledWith("user_abc");
  });

  it("soft-deletes on user.deleted", async () => {
    verifyWebhook.mockResolvedValue({
      type: "user.deleted",
      data: { id: "user_gone" },
    });

    const { POST } = await import("@/app/api/webhooks/clerk/route");
    const res = await POST(
      new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: "{}",
      }) as never,
    );
    expect(res.status).toBe(200);
    expect(softDeleteUserProfile).toHaveBeenCalledWith("user_gone");
  });
});
