#!/usr/bin/env tsx
/**
 * Repository secret and personal-data scan (tracked files).
 * Does not print secret values. Fails on high-confidence live key patterns
 * outside allowlisted fixture/test paths.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const patterns: Array<{ name: string; re: RegExp }> = [
  { name: "stripe_live_sk", re: /sk_live_[A-Za-z0-9]{16,}/g },
  { name: "stripe_whsec", re: /whsec_[A-Za-z0-9]{16,}/g },
  { name: "aws_access_key", re: /AKIA[0-9A-Z]{16}/g },
  { name: "private_key_block", re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "personal_email", re: /alex@accompli\.sh/gi },
  { name: "personal_domain", re: /https?:\/\/accompli\.sh\b/gi },
];

const allowPath =
  /(^|\/)(tests\/|.*\.test\.(ts|tsx|go)|.*_test\.go|fixtures\/|\.env\.example|docs\/|.*secret-scanning|glossary\/content\/|content\/)/i;

function gitFiles(): string[] {
  const out = execSync("git ls-files", { encoding: "utf8" });
  return out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter(
      (p) =>
        !p.startsWith("node_modules/") &&
        !p.startsWith(".next/") &&
        !p.endsWith("package-lock.json") &&
        !p.endsWith(".png") &&
        !p.endsWith(".jpg") &&
        !p.endsWith(".webp") &&
        !p.endsWith(".ico") &&
        !p.endsWith(".woff2") &&
        !p.endsWith(".svg"),
    );
}

const files = gitFiles();
const findings: Array<{ file: string; name: string }> = [];

for (const file of files) {
  if (allowPath.test(file)) continue;
  let content = "";
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  for (const { name, re } of patterns) {
    re.lastIndex = 0;
    if (re.test(content)) {
      findings.push({ file, name });
    }
  }
}

if (findings.length > 0) {
  console.error("Secret scan FAILED (pattern matches outside allowlist):");
  for (const f of findings) {
    console.error(`  ${f.name} in ${f.file}`);
  }
  process.exit(1);
}

console.log(`Secret scan OK across ${files.length} tracked files.`);
process.exit(0);
