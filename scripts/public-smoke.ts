#!/usr/bin/env tsx
/**
 * Public production smoke checks (no auth). Exit 1 on failure.
 *
 *   SMOKE_BASE_URL=https://fajita.io npm run smoke:public
 */
import { publicSmokePaths } from "../src/lib/site/public-routes";

const base = (process.env.SMOKE_BASE_URL || "https://fajita.io").replace(
  /\/$/,
  "",
);

const paths = publicSmokePaths();

async function check(path: string) {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "fajita-public-smoke/1.0" },
  });
  if (!res.ok) {
    throw new Error(`${url} → ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (path.endsWith(".txt") || path.endsWith(".xml")) {
    const text = await res.text();
    if (text.length < 20) throw new Error(`${url} body too short`);
    console.log(`OK ${res.status} ${path}`);
    return;
  }
  if (!ct.includes("text/html") && !ct.includes("text/plain")) {
    // Allow next image routes etc. if ever added.
  }
  console.log(`OK ${res.status} ${path}`);
}

async function main() {
  console.log(`Public smoke against ${base}`);
  const failures: string[] = [];
  for (const path of paths) {
    try {
      await check(path);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      failures.push(msg);
      console.error(`FAIL ${msg}`);
    }
  }
  if (failures.length > 0) {
    console.error(`${failures.length} smoke failures`);
    process.exit(1);
  }
  console.log(`Public smoke passed (${paths.length} paths).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
