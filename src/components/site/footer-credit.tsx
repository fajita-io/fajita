const ACCOMPLISH_URL = "https://accompli.sh";

export function FooterCreditLink() {
  return (
    <>
      Built by{" "}
      <a
        href={ACCOMPLISH_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fj-footer-credit__link"
      >
        Accomplish
      </a>
    </>
  );
}

/** Shared footer attribution line. */
export function FooterCredit({ className }: { className?: string }) {
  return (
    <p className={className}>
      <FooterCreditLink />
    </p>
  );
}
