import { NextResponse } from "next/server";

import { searchContent } from "@/lib/content/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const hits = searchContent(q, 20);
  return NextResponse.json({ hits });
}
