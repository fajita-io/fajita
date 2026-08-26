import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Static validation for self-host bootstrap artifacts.
 * Does not start Docker or connect to external services.
 */
describe("self-host clean install artifacts", () => {
  const root = process.cwd();

  it("includes docker compose and migration runner", () => {
    expect(existsSync(join(root, "docker-compose.yml"))).toBe(true);
    expect(existsSync(join(root, "docker/db/apply-migrations.sh"))).toBe(true);
  });

  it("documents deployment mode in env example", () => {
    const example = readFileSync(join(root, ".env.example"), "utf8");
    expect(example).toContain("FAJITA_DEPLOYMENT_MODE");
    expect(example).toContain("self_hosted");
  });

  it("exposes doctor and migrate scripts", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts["selfhost:doctor"]).toBeTruthy();
    expect(pkg.scripts["db:migrate"]).toBeTruthy();
    expect(pkg.scripts["oss:selfhost-check"]).toBeTruthy();
  });
});
