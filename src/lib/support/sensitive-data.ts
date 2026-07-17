export type SensitiveDetectionType =
  | "password"
  | "api_key"
  | "jwt"
  | "oauth_token"
  | "stripe_key"
  | "supabase_key"
  | "slack_webhook"
  | "discord_webhook"
  | "webhook_secret"
  | "heartbeat_token"
  | "authorization_header"
  | "database_url"
  | "card_number"
  | "cvc"
  | "tax_id"
  | "private_key"
  | "recovery_code"
  | "session_cookie";

export interface SensitiveScanResult {
  redactedText: string;
  detections: SensitiveDetectionType[];
  blocked: boolean;
}

const PATTERNS: Array<{ type: SensitiveDetectionType; re: RegExp }> = [
  { type: "private_key", re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/gi },
  { type: "stripe_key", re: /\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g },
  { type: "supabase_key", re: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g },
  { type: "jwt", re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
  { type: "slack_webhook", re: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9_/]+/gi },
  { type: "discord_webhook", re: /https:\/\/(?:discord(?:app)?\.com|discord\.com)\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+/gi },
  { type: "database_url", re: /\b(?:postgres|postgresql|mysql|mongodb(?:\+srv)?):\/\/[^\s]+/gi },
  { type: "authorization_header", re: /\b(?:Authorization:\s*)?(?:Bearer|Basic)\s+[A-Za-z0-9._\-+/=]{12,}/gi },
  { type: "api_key", re: /\b(?:api[_-]?key|apikey|access[_-]?token|secret[_-]?key)\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{16,}['\"]?/gi },
  { type: "webhook_secret", re: /\b(?:whsec_|webhook[_-]?secret)[A-Za-z0-9_\-]{8,}/gi },
  { type: "heartbeat_token", re: /\b(?:heartbeat[_-]?token|hb[_-]?token)\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{12,}['\"]?/gi },
  { type: "card_number", re: /\b(?:\d[ -]*?){13,19}\b/g },
  { type: "cvc", re: /\b(?:cvc|cvv|cid)\s*[:=]\s*\d{3,4}\b/gi },
  { type: "tax_id", re: /\b(?:ssn|ein|itin)\s*[:=]\s*[\d-]{5,}\b/gi },
  { type: "password", re: /\b(?:password|passwd|pwd)\s*[:=]\s*\S+/gi },
  { type: "session_cookie", re: /\b(?:session|sid|__session)\s*[:=]\s*[A-Za-z0-9._-]{16,}/gi },
  { type: "recovery_code", re: /\brecovery[_-]?code\s*[:=]\s*[A-Za-z0-9-]{8,}/gi },
  { type: "oauth_token", re: /\b(?:xox[baprs]-|ghp_|github_pat_)[A-Za-z0-9_]{10,}/g },
];

const REDACTION = "[redacted]";

function looksLikeLuhn(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function scanSensitiveData(input: string): SensitiveScanResult {
  let redactedText = input;
  const detections = new Set<SensitiveDetectionType>();

  for (const { type, re } of PATTERNS) {
    re.lastIndex = 0;
    if (type === "card_number") {
      redactedText = redactedText.replace(re, (match) => {
        const digits = match.replace(/\D/g, "");
        if (digits.length < 13 || digits.length > 19) return match;
        if (!looksLikeLuhn(digits)) return match;
        detections.add("card_number");
        return REDACTION;
      });
      continue;
    }
    if (re.test(redactedText)) {
      detections.add(type);
      re.lastIndex = 0;
      redactedText = redactedText.replace(re, REDACTION);
    }
  }

  const list = [...detections];
  return {
    redactedText,
    detections: list,
    blocked: list.length > 0,
  };
}
