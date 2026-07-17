import type { CSSProperties, ElementType, ReactNode } from "react";

interface TypeProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

function make(role: string, defaultTag: ElementType) {
  function Component({ as, children, className, style, id }: TypeProps) {
    const Tag = as ?? defaultTag;
    return (
      <Tag id={id} className={`${role}${className ? ` ${className}` : ""}`} style={style}>
        {children}
      </Tag>
    );
  }
  Component.displayName = role;
  return Component;
}

/** Marketing hero scale. Never inside the application. */
export const Display = make("fj-display-1", "h1");
export const DisplayTwo = make("fj-display-2", "h2");
export const HeadingOne = make("fj-heading-1", "h2");
export const HeadingTwo = make("fj-heading-2", "h3");
export const HeadingThree = make("fj-heading-3", "h4");
export const BodyLarge = make("fj-body-lg", "p");
export const Body = make("fj-body", "p");
export const BodySmall = make("fj-body-sm", "p");
export const Caption = make("fj-caption", "p");
/** The mono all-caps line above section headings. */
export const Eyebrow = make("fj-eyebrow", "p");
export const Prose = make("fj-prose", "div");

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  lede?: string;
  /** Heading level for the title. Default h2. */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/** Standard section opener: eyebrow, display heading, optional lede. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  as = "h2",
  className,
  style,
}: SectionHeadingProps) {
  const Tag = as;
  return (
    <header className={className} style={style}>
      {eyebrow ? (
        <p className="fj-eyebrow" style={{ marginBottom: "var(--space-3)" }}>
          {eyebrow}
        </p>
      ) : null}
      <Tag className="fj-heading-1" style={{ margin: 0 }}>
        {title}
      </Tag>
      {lede ? (
        <p
          className="fj-body-lg"
          style={{ marginTop: "var(--space-4)", maxWidth: "var(--container-reading)" }}
        >
          {lede}
        </p>
      ) : null}
    </header>
  );
}
