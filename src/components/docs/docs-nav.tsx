"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { MODEL_LABELS } from "@/lib/docs/categories";
import type { NavModel } from "@/lib/docs/registry";

/**
 * Sidebar navigation with active-page highlighting and a mobile drawer. The
 * tree is generated on the server from the content registry and passed in as
 * plain data.
 */
export function DocsNav({ nav }: { nav: NavModel[] }) {
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname]);

  const tree = (
    <nav className="fj-docs-nav" aria-label="Documentation">
      {nav.map((model) => (
        <div key={model.model} className="fj-docs-nav__model">
          <p className="fj-docs-nav__model-label">{MODEL_LABELS[model.model]}</p>
          {model.categories.map((cat) => (
            <div key={cat.id} className="fj-docs-nav__cat">
              <p className="fj-docs-nav__cat-label" id={cat.id}>
                {cat.label}
              </p>
              <ul className="fj-docs-nav__list">
                {cat.links.map((link) => {
                  const href = `/docs/${link.slug}`;
                  const active = pathname === href;
                  return (
                    <li key={link.slug}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`fj-docs-nav__link${active ? " is-active" : ""}${
                          link.deprecated ? " is-deprecated" : ""
                        }`}
                      >
                        {link.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        className="fj-docs-nav-toggle"
        aria-expanded={openMobile}
        onClick={() => setOpenMobile((o) => !o)}
      >
        {openMobile ? "Close menu" : "Browse docs"}
      </button>
      <div className="fj-docs-sidebar fj-docs-sidebar--desktop">{tree}</div>
      {openMobile ? (
        <div className="fj-docs-sidebar fj-docs-sidebar--mobile">{tree}</div>
      ) : null}
    </>
  );
}
