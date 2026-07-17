import { contentManifest } from "@/lib/content/registry";

export function GET() {
  return Response.json(contentManifest(), {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
