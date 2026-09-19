#!/usr/bin/env node

// scripts/migrate-prod.mjs
// Applies pending Prisma migrations to the database when DATABASE_URL points to
// PostgreSQL (production). `prisma migrate deploy` is idempotent: it records
// applied migrations in the `_prisma_migrations` table and only applies the ones
// that are still pending, so re-running it on every deployment never destroys
// existing data.
//
// For SQLite (local development) this is a no-op — developer databases are
// managed with `npm run db:migrate` / `npm run db:reset`.

import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const dbUrl = process.env.DATABASE_URL ?? "";
const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

if (!isPostgres) {
  console.log("[migrate-prod] DATABASE_URL is not PostgreSQL — skipping migrations (SQLite development setup).");
  process.exit(0);
}

const prismaBin = resolve(ROOT, "node_modules/prisma/build/index.js");
const schemaPath = resolve(ROOT, "prisma/postgres/schema.prisma");

console.log("[migrate-prod] Applying pending Prisma migrations to PostgreSQL...");

try {
  execSync(`node "${prismaBin}" migrate deploy --schema="${schemaPath}"`, {
    cwd: ROOT,
    stdio: "inherit",
  });
  console.log("[migrate-prod] Prisma migrations up to date.");
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[migrate-prod] prisma migrate deploy FAILED. Output above. Detail:");
  console.error(message);
  process.exit(1);
}