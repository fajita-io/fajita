import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Legacy waitlist endpoint. Accounts are open; send visitors to signup. */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Accounts are open. Create one at /signup.",
      redirect: "/signup",
    },
    { status: 410 },
  );
}
