import { BrandButtonLink } from "@/components/design-system/primitives";

export default function AppNotFound() {
  return (
    <div className="fj-empty">
      <h1 className="fj-empty__title">We could not find that page.</h1>
      <p className="fj-empty__desc">
        The page may have moved, or the link is out of date. Head back to your
        overview and pick up where you left off.
      </p>
      <BrandButtonLink href="/app">Back to overview</BrandButtonLink>
    </div>
  );
}
