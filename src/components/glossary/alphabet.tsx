import Link from "next/link";

export function GlossaryAlphabet({
  letters,
  active,
}: {
  letters: { letter: string; count: number }[];
  active?: string;
}) {
  return (
    <nav className="fj-glossary-alpha" aria-label="Alphabetical index">
      <ul className="fj-glossary-alpha__list">
        {letters.map(({ letter, count }) => {
          const upper = letter.toUpperCase();
          const isActive = active?.toLowerCase() === letter;
          if (count === 0) {
            return (
              <li key={letter}>
                <span
                  className="fj-glossary-alpha__item fj-glossary-alpha__item--disabled"
                  aria-disabled="true"
                >
                  {upper}
                </span>
              </li>
            );
          }
          return (
            <li key={letter}>
              <Link
                href={`/glossary/letter/${letter}`}
                className={
                  isActive
                    ? "fj-glossary-alpha__item fj-glossary-alpha__item--active"
                    : "fj-glossary-alpha__item"
                }
                aria-current={isActive ? "page" : undefined}
              >
                {upper}
                <span className="fj-sr-only">
                  {`, ${count} term${count === 1 ? "" : "s"}`}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
