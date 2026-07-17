import Link from "next/link";
import { Fragment } from "react";

import { parseInline } from "@/lib/docs/inline";

/** Render a string of safe inline markup (`code` and [label](href)) to React. */
export function Inline({ text }: { text: string }) {
  const segments = parseInline(text);
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "code") {
          return (
            <code key={i} className="fj-docs-inline-code">
              {seg.value}
            </code>
          );
        }
        if (seg.type === "link") {
          if (seg.external) {
            return (
              <a key={i} href={seg.href} target="_blank" rel="noopener noreferrer">
                {seg.label}
              </a>
            );
          }
          return (
            <Link key={i} href={seg.href}>
              {seg.label}
            </Link>
          );
        }
        return <Fragment key={i}>{seg.value}</Fragment>;
      })}
    </>
  );
}
