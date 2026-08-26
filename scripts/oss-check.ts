#!/usr/bin/env tsx
/**
 * Open-source readiness gate. Runs locally and in CI before public release prep.
 * Does not print secret values.
 */
import { execSync } from "node:child_process";
import { readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const skipBuild = args.has("--skip-build");

type Step = { name: string; run: () => void };

function sh(cmd: string): void {
  execSync(cmd, { cwd: root, stdio: "inherit", env: process.env });
}

function gitTracked(pattern: RegExp): string[] {
  const out = execSync("git ls-files", { cwd: root, encoding: "utf8" });
  return out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((p) => pattern.test(p));
}

const forbiddenTracked = [
  {
    name: "accidental_env_files",
    files: gitTracked(/^\.env(\.|$)/).filter((p) => p !== ".env.example"),
  },
  {
    name: "private_keys",
    files: gitTracked(/\.(pem|p12|key)$/i),
  },
  {
    name: "database_dumps",
    files: gitTracked(/\.(sql\.dump|dump|sqlite|db)$/i),
  },
];

const largeFileThreshold = 512 * 1024;
const largeTracked: string[] = [];
for (const file of gitTracked(/.*/)) {
  if (file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".webp")) continue;
  try {
    const size = statSync(join(root, file)).size;
    if (size > largeFileThreshold) largeTracked.push(`${file} (${size} bytes)`);
  } catch {
    /* ignore missing */
  }
}

const credentialPatterns: Array<{ name: string; re: RegExp }> = [
  { name: "stripe_live_sk", re: /sk_live_[A-Za-z0-9]{16,}/ },
  { name: "stripe_whsec", re: /whsec_[A-Za-z0-9]{16,}/ },
  { name: "aws_access_key", re: /AKIA[0-9A-Z]{16}/ },
  { name: "private_key_block", re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "supabase_service_jwt", re: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/ },
  { name: "personal_email", re: /alex@accompli\.sh/i },
  { name: "personal_domain", re: /https?:\/\/accompli\.sh\b/i },
];

const allowPath =
  /(^|\/)(tests\/|.*\.test\.(ts|tsx|go)|.*_test\.go|fixtures\/|\.env\.example|scripts\/oss-check|scripts\/secret-scan|glossary\/content\/|content\/)/i;

function scanTrackedCredentials(): Array<{ file: string; name: string }> {
  const findings: Array<{ file: string; name: string }> = [];
  for (const file of gitTracked(/.*/)) {
    if (allowPath.test(file)) continue;
    let content = "";
    try {
      content = readFileSync(join(root, file), "utf8");
    } catch {
      continue;
    }
    for (const { name, re } of credentialPatterns) {
      if (re.test(content)) findings.push({ file, name });
    }
  }
  return findings;
}

const steps: Step[] = [
  {
    name: "forbidden_tracked_files",
    run: () => {
      for (const group of forbiddenTracked) {
        if (group.files.length > 0) {
          throw new Error(
            `${group.name}: tracked files must not be committed:\n  ${group.files.join("\n  ")}`,
          );
        }
      }
    },
  },
  {
    name: "large_tracked_files",
    run: () => {
      if (largeTracked.length > 0) {
        throw new Error(
          `Large tracked files (>${largeFileThreshold} bytes):\n  ${largeTracked.join("\n  ")}`,
        );
      }
    },
  },
  {
    name: "credential_pattern_scan",
    run: () => {
      const findings = scanTrackedCredentials();
      if (findings.length > 0) {
        const lines = findings.map((f) => `  ${f.name} in ${f.file}`);
        throw new Error(`Credential pattern matches outside allowlist:\n${lines.join("\n")}`);
      }
    },
  },
  {
    name: "license_file",
    run: () => {
      if (!existsSync(join(root, "LICENSE"))) {
        throw new Error("LICENSE (AGPL-3.0) is required at repository root");
      }
      if (!existsSync(join(root, "CONTRIBUTING.md"))) {
        throw new Error("CONTRIBUTING.md is required at repository root");
      }
      if (!existsSync(join(root, "README.md"))) {
        throw new Error("README.md is required at repository root");
      }
      if (!existsSync(join(root, "CODE_OF_CONDUCT.md"))) {
        throw new Error("CODE_OF_CONDUCT.md is required at repository root");
      }
    },
  },
  {
    name: "secret_scan_script",
    run: () => sh("npx tsx scripts/secret-scan.ts"),
  },
  {
    name: "typecheck",
    run: () => sh("npm run typecheck"),
  },
  {
    name: "lint",
    run: () => sh("npm run lint"),
  },
  {
    name: "test",
    run: () => sh("npm test"),
  },
];

if (!skipBuild) {
  steps.push({
    name: "build",
    run: () => sh("npm run build"),
  });
}

let failed = false;
for (const step of steps) {
  process.stdout.write(`oss:check ${step.name}… `);
  try {
    step.run();
    console.log("OK");
  } catch (error) {
    failed = true;
    console.log("FAILED");
    console.error(error instanceof Error ? error.message : error);
  }
}

process.exit(failed ? 1 : 0);
