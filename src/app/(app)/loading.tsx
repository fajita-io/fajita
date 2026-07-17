import { Skeleton } from "@/components/app/ui";

export default function AppLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" role="status">
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Skeleton width="14rem" height="2rem" />
        <div style={{ marginTop: "var(--space-3)" }}>
          <Skeleton width="26rem" height="1rem" />
        </div>
      </div>
      <Skeleton height="9rem" radius="var(--radius-lg)" style={{ marginBottom: "var(--space-5)" }} />
      <Skeleton height="14rem" radius="var(--radius-lg)" />
      <span className="fj-visually-hidden">Loading your workspace.</span>
    </div>
  );
}
