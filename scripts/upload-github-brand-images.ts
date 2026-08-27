#!/usr/bin/env tsx
/**
 * Upload Fajita brand images to GitHub via the uploads API.
 * Requires `gh auth refresh -h github.com -s admin:org`.
 */
import { createReadStream, statSync } from "node:fs";
import { join } from "node:path";
import { request } from "undici";

const root = process.cwd();

async function uploadMultipart(url: string, filePath: string): Promise<void> {
  const size = statSync(filePath).size;
  const boundary = `----fajita${Date.now()}`;
  const filename = filePath.split("/").pop() ?? "upload.png";
  const fileData = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    createReadStream(filePath)
      .on("data", (chunk) => chunks.push(Buffer.from(chunk)))
      .on("error", reject)
      .on("end", () => resolve(Buffer.concat(chunks)));
  });

  const prefix = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="size"\r\n\r\n${size}\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="content_type"\r\n\r\nimage/png\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: image/png\r\n\r\n`,
  );
  const suffix = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([prefix, fileData, suffix]);

  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Set GH_TOKEN or GITHUB_TOKEN, or run via gh auth token export.");
  }

  const response = await request(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": String(body.length),
    },
    body,
  });

  const text = await response.body.text();
  if (response.statusCode >= 400) {
    throw new Error(`${url} failed (${response.statusCode}): ${text}`);
  }
  console.log(`uploaded ${filePath} -> ${url}`);
}

async function main(): Promise<void> {
  const token =
    process.env.GH_TOKEN ??
    process.env.GITHUB_TOKEN ??
    (await import("node:child_process")).execSync("gh auth token", { encoding: "utf8" }).trim();

  process.env.GH_TOKEN = token;

  await uploadMultipart(
    "https://uploads.github.com/orgs/fajita-io/avatar",
    join(root, "public/brand/github/fajita-org-avatar.png"),
  );
  await uploadMultipart(
    "https://uploads.github.com/repos/fajita-io/fajita/social-preview",
    join(root, "public/brand/github/fajita-repo-social.png"),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
