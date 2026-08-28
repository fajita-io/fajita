"use client";

import dynamic from "next/dynamic";

const ProductHuntBanner = dynamic(
  () =>
    import("@/components/site/product-hunt-banner").then(
      (m) => m.ProductHuntBanner,
    ),
  { ssr: false },
);

export function DeferredProductHuntBanner() {
  return <ProductHuntBanner />;
}
