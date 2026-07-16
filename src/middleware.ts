import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";
import { trackAICrawlerRequest } from "@datafast/ai-crawl";

import { datafastConfig } from "@/lib/analytics/config";

/**
 * Bot traffic tracking for AI crawlers, search engines, and training bots.
 * Do not await trackAICrawlerRequest; it runs in the background via waitUntil.
 *
 * @see https://datafa.st/docs/bot-traffic-tracking
 */
export function middleware(request: NextRequest, event: NextFetchEvent) {
  trackAICrawlerRequest(request, event, {
    websiteId: datafastConfig.websiteId,
    ...(process.env.DATAFAST_BOT_TOKEN
      ? { authToken: process.env.DATAFAST_BOT_TOKEN }
      : {}),
  });

  return NextResponse.next();
}

export const config = {
  // Keep robots.txt, llms.txt, and sitemap files reachable by this middleware.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
