import { ogContentType, ogSize, pageOgImage } from "@/lib/site/og";

export const alt = "Fajita";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return pageOgImage("changelog");
}
