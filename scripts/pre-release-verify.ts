#!/usr/bin/env tsx
/**
 * Pre-public-release verification. Runs all OSS gates and prints a checklist.
 * Does not print secret values. Does not rotate secrets (see secret-rotation-run).
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

type Item = { label: string; ok: boolean; detail: string };

function run(cmd: string): boolean {
  try {
    execSync(cmd, { cwd: root, stdio: "pipe", env: process.env });
    return true;
  } catch {
    return false;
  }
}

function file(path: string): boolean {
  return existsSync(join(root, path));
}

const items: Item[] = [
  { label: "LICENSE (AGPL-3.0)", ok: file("LICENSE"), detail: file("LICENSE") ? "present" : "missing" },
  { label: "README.md", ok: file("README.md"), detail: file("README.md") ? "present" : "missing" },
  { label: "CONTRIBUTING.md", ok: file("CONTRIBUTING.md"), detail: file("CONTRIBUTING.md") ? "present" : "missing" },
  { label: "SECURITY.md", ok: file("SECURITY.md"), detail: file("SECURITY.md") ? "present" : "missing" },
  { label: "TRADEMARKS.md", ok: file("TRADEMARKS.md"), detail: file("TRADEMARKS.md") ? "present" : "missing" },
  { label: "CODE_OF_CONDUCT.md", ok: file("CODE_OF_CONDUCT.md"), detail: file("CODE_OF_CONDUCT.md") ? "present" : "missing" },
  { label: ".env.example", ok: file(".env.example"), detail: file(".env.example") ? "present" : "missing" },
  { label: "docker-compose.yml", ok: file("docker-compose.yml"), detail: file("docker-compose.yml") ? "present" : "missing" },
  { label: "Self-host docs", ok: file("docs/self-hosting/QUICKSTART.md"), detail: "docs/self-hosting/" },
  { label: "Secret scan", ok: run("npx tsx scripts/secret-scan.ts"), detail: "scripts/secret-scan.ts" },
  { label: "Typecheck", ok: run("npm run typecheck"), detail: "tsc --noEmit" },
  { label: "Tests", ok: run("npm test"), detail: "vitest run" },
  { label: "npm audit clean", ok: run("npm audit --audit-level=high"), detail: "no high/critical vulns" },
  { label: "Compose config", ok: run("docker compose config -q"), detail: "docker compose config" },
];

console.log("Fajita pre-release verification\n");

let failed = 0;
for (const item of items) {
  const icon = item.ok ? "✓" : "✗";
  if (!item.ok) failed += 1;
  console.log(`${icon} ${item.label}: ${item.detail}`);
}

console.log("\n--- Operator tasks (cannot automate) ---");
console.log("• Rotate all secrets per docs/open-source/SECRET_ROTATION_RUNBOOK.md");
console.log("• Legal counsel sign-off per docs/open-source/LEGAL_REVIEW_CHECKLIST.md");
console.log("• Make repository public when ready");
console.log("• Publish GitHub release to trigger container images");

if (failed > 0) {
  console.log(`\n${failed} automated check(s) failed.`);
  process.exit(1);
}

console.log("\n✓ All automated pre-release checks passed.");
console.log("Complete operator tasks above, then follow docs/open-source/RELEASE.md");
