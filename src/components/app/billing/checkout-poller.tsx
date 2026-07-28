"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Bounded client poller for the checkout success page. While the subscription
 * is not yet confirmed by the verified webhook, it refreshes server state a few
 * times, then stops. The success page never claims the plan is active before
 * the internal subscription state says so.
 */
export function CheckoutPoller({ done }: { done: boolean }) {
  const router = useRouter();
  const attempts = useRef(0);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      attempts.current += 1;
      if (attempts.current > 12) {
        clearInterval(id);
        return;
      }
      router.refresh();
    }, 2500);
    return () => clearInterval(id);
  }, [done, router]);

  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => {
      router.replace("/app/onboarding");
    }, 1200);
    return () => window.clearTimeout(id);
  }, [done, router]);

  return null;
}
