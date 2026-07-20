import { ReadingAttribution } from "@/components/site/reading-attribution";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ReadingAttribution className="fj-container" />
    </>
  );
}
