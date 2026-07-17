/**
 * Typed authorization errors. Server actions throw these; the UI maps them to
 * calm, plain-language messages. They never carry provider internals, SQL, or
 * secrets in their message.
 */

export type AuthErrorKind =
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "suspended"
  | "org_unavailable"
  | "step_up_required"
  | "validation"
  | "rate_limited"
  | "conflict";

export class AppAuthError extends Error {
  readonly kind: AuthErrorKind;
  constructor(kind: AuthErrorKind, message: string) {
    super(message);
    this.name = "AppAuthError";
    this.kind = kind;
  }
}

export const Unauthenticated = () =>
  new AppAuthError("unauthenticated", "You need to sign in to continue.");
export const Forbidden = (msg = "You do not have access to do that.") =>
  new AppAuthError("forbidden", msg);
export const NotFound = (msg = "We could not find that.") =>
  new AppAuthError("not_found", msg);
export const Suspended = () =>
  new AppAuthError("suspended", "This account is suspended.");
export const OrgUnavailable = () =>
  new AppAuthError("org_unavailable", "This organization is unavailable.");
export const StepUpRequired = () =>
  new AppAuthError(
    "step_up_required",
    "Confirm it is you before making this change.",
  );
export const Conflict = (msg: string) => new AppAuthError("conflict", msg);
export const RateLimited = (msg = "Too many attempts. Try again shortly.") =>
  new AppAuthError("rate_limited", msg);
