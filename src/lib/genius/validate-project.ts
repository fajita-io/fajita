import { GENIUS_PROJECT_KEY, GENIUS_WIDGET_SRC, isValidGeniusProjectKeyFormat } from "@/lib/genius/config";

export { isValidGeniusProjectKeyFormat };

/**
 * Confirms the publishable key resolves to an active Genius project.
 * Logs a clear warning when misconfigured so feedback failures are obvious.
 */
export async function warnIfGeniusProjectInvalid(
  projectKey = GENIUS_PROJECT_KEY,
): Promise<boolean> {
  if (!isValidGeniusProjectKeyFormat(projectKey)) {
    console.warn(
      "[Genius] Feedback is disabled: set NEXT_PUBLIC_GENIUS_PROJECT_KEY to a valid publishable key.",
    );
    return false;
  }

  try {
    const apiOrigin = new URL(GENIUS_WIDGET_SRC).origin;
    const response = await fetch(
      `${apiOrigin}/api/v1/widget/config?publicKey=${encodeURIComponent(projectKey)}`,
      { method: "GET", credentials: "omit" },
    );

    if (response.ok) {
      return true;
    }

    const body = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    const detail =
      body?.error ??
      "Genius rejected this project key. Submissions will fail until the key is updated.";

    console.warn(`[Genius] Feedback cannot be sent: ${detail}`);
    return false;
  } catch {
    return true;
  }
}
