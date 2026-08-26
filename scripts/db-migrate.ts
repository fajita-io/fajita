#!/usr/bin/env tsx
/**
 * Apply pending database migrations to DATABASE_URL.
 * Tracks applied versions in public.schema_migrations.
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const migrationsDir = join(root, "supabase/migrations");
const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

if (!existsSync(migrationsDir)) {
  console.error(`No migrations at ${migrationsDir}`);
  process.exit(1);
}

execSync(`bash docker/db/apply-migrations.sh`, {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: databaseUrl },
});

const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
console.log(`Migration run complete (${files.length} files in repository).`);
