#!/usr/bin/env tsx
/**
 * Scan supabase/migrations for CREATE TABLE and RLS enablement.
 * Fails if a public table is created without a later/same-file ENABLE ROW LEVEL SECURITY.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = join(process.cwd(), "supabase/migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const created = new Map<string, string>();
const dropped = new Set<string>();
const rlsEnabled = new Set<string>();

const createRe =
  /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-z0-9_]+)/gi;
const dropRe =
  /drop\s+table\s+(?:if\s+exists\s+)?(?:public\.)?([a-z0-9_]+)/gi;
const rlsRe =
  /alter\s+table\s+(?:public\.)?([a-z0-9_]+)\s+enable\s+row\s+level\s+security/gi;

for (const file of files) {
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  for (const m of sql.matchAll(dropRe)) {
    dropped.add(m[1].toLowerCase());
    created.delete(m[1].toLowerCase());
  }
  for (const m of sql.matchAll(createRe)) {
    const table = m[1].toLowerCase();
    if (!dropped.has(table)) created.set(table, file);
  }
  for (const m of sql.matchAll(rlsRe)) {
    rlsEnabled.add(m[1].toLowerCase());
  }
}

const missing: string[] = [];
for (const [table, file] of created) {
  if (!rlsEnabled.has(table)) {
    missing.push(`${table} (created in ${file})`);
  }
}

console.log(`RLS inventory: ${created.size} live public tables scanned`);
console.log(`RLS enabled: ${rlsEnabled.size} alter statements matched`);

if (missing.length > 0) {
  console.error("Tables missing ENABLE ROW LEVEL SECURITY:");
  for (const row of missing) console.error(`  - ${row}`);
  process.exit(1);
}

console.log("OK: every surviving CREATE TABLE has RLS enabled in migrations.");
process.exit(0);
