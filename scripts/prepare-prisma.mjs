#!/usr/bin/env node

// scripts/prepare-prisma.mjs
// Selects the correct Prisma schema based on DATABASE_URL and generates the client.
// SQLite (file:...) → prisma/schema.prisma (dev)
// PostgreSQL (postgresql://...) → prisma/postgres/schema.prisma (prod)

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const dbUrl = process.env.DATABASE_URL ?? "";
const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

const schemaFile = isPostgres ? "prisma/postgres/schema.prisma" : "prisma/schema.prisma";
const schemaPath = resolve(ROOT, schemaFile);

if (!existsSync(schemaPath)) {
  console.error(`[prepare-prisma] Schema not found: ${schemaFile}`);
  process.exit(1);
}

const prismaBin = resolve(ROOT, "node_modules/prisma/build/index.js");

console.log(`[prepare-prisma] Using ${isPostgres ? "PostgreSQL" : "SQLite"} schema: ${schemaFile}`);

try {
  execSync(`node "${prismaBin}" generate --schema="${schemaPath}"`, {
    cwd: ROOT,
    stdio: "inherit",
  });
  console.log("[prepare-prisma] Prisma client generated successfully.");
} catch {
  console.error("[prepare-prisma] prisma generate failed.");
  process.exit(1);
}
