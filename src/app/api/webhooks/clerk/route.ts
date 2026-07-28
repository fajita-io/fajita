import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";

import {
  ensureUserProfile,
  softDeleteUserProfile,
  suspendUserProfile,
  unsuspendUserProfile,
} from "@/lib/auth/provisioning";
import { DataFastGoals, trackServerGoal } from "@/lib/analytics";

export const runtime = "nodejs";

interface ClerkUserData {
  id: string;
  email_addresses?: { id: string; email_address: string }[];
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  image_url?: string | null;
  banned?: boolean;
}

function primaryEmail(data: ClerkUserData): string | null {
  const list = data.email_addresses ?? [];
  const primary = list.find((e) => e.id === data.primary_email_address_id);
  return primary?.email_address ?? list[0]?.email_address ?? null;
}

function displayName(data: ClerkUserData): string | null {
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ").trim();
  return name || data.username || null;
}

/**
 * Clerk webhook. Verifies the svix signature (CLERK_WEBHOOK_SIGNING_SECRET)
 * before doing anything. Provisioning is idempotent, so redelivery is safe.
 * On failure we return non-2xx so Clerk retries.
 */
export async function POST(req: NextRequest) {
  let evt: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    evt = await verifyWebhook(req);
  } catch (error) {
    console.error("[clerk-webhook] signature verification failed", error);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    const type = evt.type;
    const data = evt.data as unknown as ClerkUserData;

    switch (type) {
      case "user.created": {
        await ensureUserProfile({
          id: data.id,
          primaryEmail: primaryEmail(data),
          displayName: displayName(data),
          avatarUrl: data.image_url ?? null,
        });
        await trackServerGoal({ name: DataFastGoals.signup }).catch(() => {});
        if (data.banned) {
          await suspendUserProfile(data.id);
        } else {
          await unsuspendUserProfile(data.id);
        }
        break;
      }
      case "user.updated": {
        await ensureUserProfile({
          id: data.id,
          primaryEmail: primaryEmail(data),
          displayName: displayName(data),
          avatarUrl: data.image_url ?? null,
        });
        if (data.banned) {
          await suspendUserProfile(data.id);
        } else {
          await unsuspendUserProfile(data.id);
        }
        break;
      }
      case "user.deleted": {
        if (data.id) await softDeleteUserProfile(data.id);
        break;
      }
      default:
        // Unhandled event types are acknowledged so Clerk stops retrying.
        break;
    }
  } catch (error) {
    console.error("[clerk-webhook] processing failed", evt.type, error);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
