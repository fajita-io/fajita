#!/usr/bin/env tsx
/**
 * Report migration status against DATABASE_URL.
 */
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1, prepare: false });

async function main(): Promise<void> {
  try {
    await sql`select 1`;
    console.log("Database reachable");

    const tableExists = await sql`
      select exists (
        select 1 from information_schema.tables
        where table_schema = 'public' and table_name = 'schema_migrations'
      ) as ok
    `;
    if (!tableExists[0]?.ok) {
      console.log("Migration tracking: not initialized (run db:migrate)");
      return;
    }

    const applied = await sql<{ version: string; applied_at: Date }[]>`
      select version, applied_at from public.schema_migrations order by version
    `;
    console.log(`Applied migrations: ${applied.length}`);
    for (const row of applied.slice(-5)) {
      console.log(`  ${row.version}`);
    }
    if (applied.length > 5) {
      console.log(`  ... and ${applied.length - 5} more`);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
