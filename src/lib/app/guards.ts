import "server-only";

import { notFound } from "next/navigation";

/**
 * Page-level guard for when a caller lacks a required capability. Navigation
 * already hides these entries, and every server action re-checks permission,
 * so reaching here means a direct URL hit without access. We show not-found
 * rather than confirming the resource exists.
 */
export function forbiddenRedirect(): never {
  notFound();
}
