/**
 * Email masking for display to operators who lack subscriber.read_sensitive.
 * Shows just enough to recognize an address without revealing it. Pure.
 *
 *   alice@example.com   -> a•••@example.com
 *   bo@example.com      -> b•@example.com
 *   x@example.com       -> •@example.com
 */
export function maskEmail(normalized: string): string {
  const at = normalized.lastIndexOf("@");
  if (at < 1) return "•••";
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  // A single-character local part is fully masked: revealing the only character
  // would reveal the whole local part.
  if (local.length <= 1) return `•@${domain}`;
  const head = local.slice(0, 1);
  const dots = "•".repeat(Math.max(1, Math.min(3, local.length - 1)));
  return `${head}${dots}@${domain}`;
}
