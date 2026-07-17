/**
 * Fajita appearance for Clerk-hosted UI (SignIn, SignUp, UserButton, user
 * profile flows). We use Clerk's components for security-critical flows and
 * theme them to the Fajita token system rather than reimplementing password,
 * verification, and MFA handling. Values reference CSS variables so the
 * components follow light/dark automatically.
 *
 * Docs: docs/application/application-shell.md (auth surfaces).
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--color-brand-ember)",
    colorText: "var(--color-text-primary)",
    colorTextSecondary: "var(--color-text-secondary)",
    colorBackground: "var(--color-background-elevated)",
    colorInputBackground: "var(--color-background-primary)",
    colorInputText: "var(--color-text-primary)",
    colorDanger: "var(--color-status-down-bold)",
    colorSuccess: "var(--color-status-operational-bold)",
    colorWarning: "var(--color-status-degraded-bold)",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-sans)",
    fontFamilyButtons: "var(--font-sans)",
  },
  elements: {
    card: {
      boxShadow: "var(--shadow-mid)",
      border: "1px solid var(--color-border-subtle)",
      backgroundColor: "var(--color-background-elevated)",
    },
    headerTitle: { fontFamily: "var(--font-display)" },
    formButtonPrimary: {
      backgroundColor: "var(--color-brand-ember)",
      textTransform: "none",
      fontWeight: 600,
    },
    footerActionLink: { color: "var(--color-brand-ember)" },
    logoBox: { display: "none" },
  },
};
