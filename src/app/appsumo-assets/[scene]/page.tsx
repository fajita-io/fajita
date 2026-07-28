import { notFound } from "next/navigation";

import {
  APPSUMO_SCENES,
  type AppsumoSceneId,
} from "@/components/marketing/appsumo-assets";

export default async function AppsumoAssetPage({
  params,
}: {
  params: Promise<{ scene: string }>;
}) {
  const { scene } = await params;
  if (!(scene in APPSUMO_SCENES)) notFound();

  const Scene = APPSUMO_SCENES[scene as AppsumoSceneId].component;
  return <Scene />;
}
