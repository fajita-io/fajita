"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
          maxWidth: 40 + "rem",
          margin: "0 auto",
        }}
      >
        <h1>Something went wrong</h1>
        <p>That page hit an error. Your work elsewhere is still safe.</p>
        {error.digest ? (
          <p style={{ color: "#666", fontSize: "0.875rem" }}>
            Reference: {error.digest}
          </p>
        ) : null}
        <button type="button" onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}
