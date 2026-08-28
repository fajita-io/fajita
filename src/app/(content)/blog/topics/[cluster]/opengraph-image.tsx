import { contentOgContentType, contentOgImage, contentOgSize } from "@/lib/site/content-og";
import { articlesInCluster, getCluster, publishedClusters } from "@/lib/content/clusters";

export const size = contentOgSize;
export const contentType = contentOgContentType;
export const alt = "Topic guides";

export function generateStaticParams() {
  return publishedClusters().map((cluster) => ({ cluster: cluster.id }));
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ cluster: string }>;
}) {
  const { cluster: clusterId } = await params;
  const cluster = getCluster(clusterId);
  const count = cluster ? articlesInCluster(clusterId).length : 0;

  return contentOgImage({
    eyebrow: "Topic hub",
    title: cluster?.name ?? "Reliability guides",
    subtitle: cluster
      ? `${count} published guide${count === 1 ? "" : "s"} · ${cluster.hubIntro}`
      : undefined,
  });
}
