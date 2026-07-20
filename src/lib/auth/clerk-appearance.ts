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
  options: {
    socialButtonsVariant: "blockButton" as const,
    socialButtonsPlacement: "top" as const,
  },
  variables: {
    colorPrimary: "var(--color-brand-ember)",
    colorPrimaryForeground: "var(--color-text-on-brand)",
    colorForeground: "var(--color-text-primary)",
    colorMutedForeground: "var(--color-text-muted)",
    colorBackground: "transparent",
    colorInput: "var(--color-background-elevated)",
    colorInputForeground: "var(--color-text-primary)",
    colorBorder: "var(--color-border-strong)",
    colorDanger: "var(--color-status-down-bold)",
    colorSuccess: "var(--color-status-operational-bold)",
    colorWarning: "var(--color-status-degraded-bold)",
    colorRing: "var(--color-focus-ring)",
    borderRadius: "var(--radius-sm)",
    spacing: "1rem",
    fontFamily: "var(--font-sans)",
    fontFamilyButtons: "var(--font-sans)",
    fontSize: "var(--text-body)",
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
    main: {
      display: "grid",
      gap: "var(--space-5)",
    },
    header: { display: "none" },
    headerTitle: { display: "none" },
    headerSubtitle: { display: "none" },
    logoBox: { display: "none" },
    footer: { display: "none" },
    footerPages: { display: "none" },
    footerAction: { display: "none" },
    socialButtonsRoot: {
      border: "none",
      boxShadow: "none",
      padding: 0,
      margin: 0,
      backgroundColor: "transparent",
    },
    socialButtons: {
      display: "grid",
      gap: "var(--space-3)",
      width: "100%",
    },
    socialButtonsBlockButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-3)",
      border: "1px solid var(--color-border-strong)",
      backgroundColor: "var(--color-background-elevated)",
      boxShadow: "none",
      fontWeight: 600,
      minHeight: "var(--touch-target-lg)",
      width: "100%",
      borderRadius: "var(--radius-sm)",
    },
    socialButtonsBlockButtonText: {
      fontWeight: 600,
      border: "none",
      backgroundColor: "transparent",
      boxShadow: "none",
      minHeight: "auto",
      width: "auto",
      padding: 0,
    },
    dividerRow: {
      marginBlock: "var(--space-5)",
      gap: "var(--space-3)",
    },
    dividerLine: {
      backgroundColor: "var(--color-border-subtle)",
      height: "1px",
    },
    dividerText: {
      color: "var(--color-text-muted)",
      fontSize: "var(--text-caption)",
      paddingInline: "var(--space-3)",
    },
    form: {
      display: "grid",
      gap: "var(--space-4)",
    },
    formFieldRow: {
      margin: 0,
    },
    formField: {
      display: "grid",
      gap: "var(--space-2)",
    },
    formFieldLabel: {
      fontWeight: 600,
      fontSize: "var(--text-body-sm)",
      color: "var(--color-text-primary)",
      margin: 0,
    },
    formFieldInput: {
      border: "1px solid var(--color-border-strong)",
      boxShadow: "none",
      minHeight: "var(--touch-target-lg)",
      padding: "var(--space-3) var(--space-4)",
      borderRadius: "var(--radius-sm)",
      fontSize: "var(--text-body)",
      backgroundColor: "var(--color-background-elevated)",
    },
    formFieldAction: {
      color: "var(--color-text-primary)",
      fontWeight: 500,
      textDecoration: "underline",
      textDecorationColor: "var(--color-brand-ember)",
      textUnderlineOffset: "0.18em",
    },
    formButtonPrimary: {
      backgroundColor: "var(--color-text-primary)",
      color: "var(--color-background-primary)",
      textTransform: "none",
      fontWeight: 600,
      boxShadow: "none",
      minHeight: "var(--touch-target-lg)",
      marginTop: "var(--space-2)",
      borderRadius: "var(--radius-sm)",
      width: "100%",
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
