#!/usr/bin/env tsx
/**
 * Seed fictional demo data for local/self-hosted development only.
 * Never run against production. Requires DEMO_SEED_ENABLED=1.
 */
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

if (process.env.DEMO_SEED_ENABLED !== "1") {
  console.error("Set DEMO_SEED_ENABLED=1 to confirm demo seeding.");
  process.exit(1);
}

if (process.env.FAJITA_DEPLOYMENT_MODE === "cloud") {
  console.error("Demo seed is not allowed in cloud mode.");
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1, prepare: false });

async function main(): Promise<void> {
  console.log("Demo seed: no-op placeholder (organizations require Clerk provisioning).");
  console.log("Create monitors through the UI after signing in.");
  await sql.end({ timeout: 5 });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
