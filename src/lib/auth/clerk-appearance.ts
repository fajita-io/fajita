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
  elevation: "flush" as const,
  variables: {
    colorPrimary: "var(--color-brand-ember)",
    colorText: "var(--color-text-primary)",
    colorTextSecondary: "var(--color-text-secondary)",
    colorBackground: "transparent",
    colorInputBackground: "var(--color-background-elevated)",
    colorInputText: "var(--color-text-primary)",
    colorDanger: "var(--color-status-down-bold)",
    colorSuccess: "var(--color-status-operational-bold)",
    colorWarning: "var(--color-status-degraded-bold)",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-sans)",
    fontFamilyButtons: "var(--font-sans)",
  },
  elements: {
    rootBox: {
      width: "100%",
      maxWidth: "none",
    },
    cardBox: {
      width: "100%",
      maxWidth: "none",
    },
    card: {
      boxShadow: "none",
      border: "none",
      backgroundColor: "transparent",
      padding: 0,
    },
    header: { display: "none" },
    headerTitle: { display: "none" },
    headerSubtitle: { display: "none" },
    logoBox: { display: "none" },
    footer: { display: "none" },
    footerPages: { display: "none" },
    footerAction: { display: "none" },
    socialButtonsBlockButton: {
      border: "1px solid var(--color-border-subtle)",
      backgroundColor: "var(--color-background-elevated)",
      boxShadow: "none",
      fontWeight: 500,
    },
    socialButtonsBlockButtonText: {
      fontWeight: 500,
    },
    dividerLine: {
      backgroundColor: "var(--color-border-subtle)",
    },
    dividerText: {
      color: "var(--color-text-muted)",
      fontSize: "var(--text-caption)",
    },
    formFieldLabel: {
      fontWeight: 600,
      color: "var(--color-text-primary)",
    },
    formFieldInput: {
      border: "1px solid var(--color-border-subtle)",
      boxShadow: "none",
    },
    formButtonPrimary: {
      backgroundColor: "var(--color-brand-ember)",
      textTransform: "none",
      fontWeight: 600,
      boxShadow: "none",
    },
    formButtonReset: {
      color: "var(--color-brand-ember)",
    },
    identityPreviewEditButton: {
      color: "var(--color-brand-ember)",
    },
    footerActionLink: { color: "var(--color-brand-ember)" },
  },
};
