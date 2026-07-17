/**
 * Anti-AI-slop and originality helpers for content-growth publication gates.
 * Assists human review. Does not replace editorial judgment.
 */

const GENERIC_OPENERS = [
  /in today'?s digital landscape/i,
  /in the fast[- ]paced world/i,
  /software reliability is more important than ever/i,
  /in this comprehensive guide/i,
  /everything you need to know/i,
  /your ultimate guide/i,
  /whether you are a startup or enterprise/i,
  /let'?s dive in/i,
  /delve into/i,
];

const BANNED_PHRASES = [
  /it is important to note/i,
  /\bin conclusion\b/i,
  /\bultimately\b/i,
  /\bunlock\b/i,
  /\bsupercharge\b/i,
  /\bleverage\b/i,
  /\bseamlessly\b/i,
  /\brobust\b/i,
  /\brevolutionary\b/i,
  /\bgame[- ]changing\b/i,
  /\bbest[- ]in[- ]class\b/i,
  /\bcutting[- ]edge\b/i,
  /\bnext[- ]generation\b/i,
  /\bone[- ]stop shop\b/i,
  /never miss an outage again/i,
  /set it and forget it/i,
  /take your monitoring to the next level/i,
  /\bstreamline\b/i,
  /\bempower\b/i,
  /helps businesses/i,
  /not only .{0,40} but also/i,
  /by understanding/i,
];

const INTERNAL_LEAKS = [
  /\bcursor\b/i,
  /\bfable\b/i,
  /\bhoneycopy\b/i,
  /\bdon draper\b/i,
  /phase \d+/i,
  /\bprompt\b/i,
  /accomplish/i,
];

const SECRET_PATTERNS = [
  /sk_live_[a-zA-Z0-9]+/,
  /sk_test_[a-zA-Z0-9]+/,
  /whsec_[a-zA-Z0-9]+/,
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/,
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
];

export interface QualityFinding {
  severity: "error" | "warning";
  code: string;
  message: string;
}

export function scanAntiAiSlop(text: string, slug: string): QualityFinding[] {
  const findings: QualityFinding[] = [];

  if (/\u2014|\u2013/.test(text) || / -- /.test(text)) {
    findings.push({
      severity: "error",
      code: "em-dash",
      message: `${slug}: contains em dash, en dash, or -- pause`,
    });
  }

  const opening = text.slice(0, 400);
  for (const re of GENERIC_OPENERS) {
    if (re.test(opening)) {
      findings.push({
        severity: "error",
        code: "generic-opener",
        message: `${slug}: generic introduction matched ${re}`,
      });
    }
  }

  for (const re of BANNED_PHRASES) {
    if (re.test(text)) {
      findings.push({
        severity: "error",
        code: "banned-phrase",
        message: `${slug}: banned phrase matched ${re}`,
      });
    }
  }

  for (const re of INTERNAL_LEAKS) {
    if (re.test(text)) {
      findings.push({
        severity: "error",
        code: "internal-leak",
        message: `${slug}: internal or forbidden language matched ${re}`,
      });
    }
  }

  for (const re of SECRET_PATTERNS) {
    if (re.test(text)) {
      findings.push({
        severity: "error",
        code: "secret-pattern",
        message: `${slug}: possible secret pattern detected`,
      });
    }
  }

  const ensureCount = (text.match(/\bensure\b/gi) ?? []).length;
  if (ensureCount >= 4) {
    findings.push({
      severity: "warning",
      code: "overuse-ensure",
      message: `${slug}: overuses "ensure" (${ensureCount} times)`,
    });
  }

  return findings;
}

export function estimateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function readingMinutesFromWords(words: number): number {
  return Math.max(2, Math.round(words / 220));
}
