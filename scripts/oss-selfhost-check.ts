#!/usr/bin/env tsx
/**
 * Phase 2 self-hosting validation gate.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const skipBuild = args.has("--skip-build");
const skipDocker = args.has("--skip-docker");

type Step = { name: string; run: () => void };

function sh(cmd: string): void {
  execSync(cmd, { cwd: root, stdio: "inherit", env: process.env });
}

const steps: Step[] = [
  { name: "typecheck", run: () => sh("npm run typecheck") },
  { name: "lint", run: () => sh("npm run lint") },
  { name: "test", run: () => sh("npm test") },
  {
    name: "deployment_config",
    run: () => sh("npx vitest run src/lib/deployment/config.test.ts"),
  },
  {
    name: "compose_config",
    run: () => {
      if (!existsSync(join(root, "docker-compose.yml"))) {
        throw new Error("docker-compose.yml missing");
      }
      sh("docker compose config -q");
    },
  },
];

if (!skipBuild) {
  steps.push({ name: "build", run: () => sh("npm run build") });
}

if (!skipDocker) {
  steps.push({
    name: "docker_build_web",
    run: () => sh("docker build -t fajita-web-test -f Dockerfile ."),
  });
}

let failed = false;
for (const step of steps) {
  process.stdout.write(`oss:selfhost-check ${step.name}… `);
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
