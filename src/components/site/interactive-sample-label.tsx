/**
 * Marks marketing previews that use deterministic sample data. One label per
 * interactive surface; tooltip explains that Fajita itself is live.
 */
export function InteractiveSampleLabel({ detail }: { detail?: string }) {
  const label = detail ? `Interactive sample · ${detail}` : "Interactive sample";

  return (
    <span
      className="fj-caption fj-interactive-sample"
      title="Sample data is used in this preview. Fajita is live and open for signup."
    >
      {label}
    </span>
  );
}
