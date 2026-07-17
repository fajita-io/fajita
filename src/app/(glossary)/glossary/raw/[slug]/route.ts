import { getTerm, llmTerms } from "@/lib/glossary/registry";
import { termToPlainText } from "@/lib/glossary/serialize";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return llmTerms().map((t) => ({ slug: t.meta.slug }));
}

export function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  return context.params.then(({ slug }) => {
    const term = getTerm(slug);
    if (
      !term ||
      term.meta.status !== "published" ||
      !term.meta.llmInclude ||
      term.meta.noindex ||
      term.meta.deprecated
    ) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(termToPlainText(term), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "X-Robots-Tag": "noindex",
      },
    });
  });
}
