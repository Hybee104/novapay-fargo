-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bank" TEXT NOT NULL DEFAULT 'NOVAPAY',
    "type" TEXT NOT NULL DEFAULT 'Premium Dollar Checking',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "accountNumber" TEXT NOT NULL,
    "routingNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "balance" DECIMAL NOT NULL DEFAULT 650000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("accountNumber", "balance", "bank", "createdAt", "currency", "id", "routingNumber", "status", "type", "updatedAt", "userId") SELECT "accountNumber", "balance", "bank", "createdAt", "currency", "id", "routingNumber", "status", "type", "updatedAt", "userId" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
  CREATE UNIQUE INDEX "Account_accountNumber_key" ON "Account"("accountNumber");
  CREATE INDEX "Account_userId_bank_idx" ON "Account"("userId", "bank");
  PRAGMA foreign_keys=ON;
  PRAGMA defer_foreign_keys=OFF;

  -- Normalise any Account rows still carrying the legacy label. The predicate is
  -- deliberately encoding-agnostic so it matches "Active - Demo", "Active — Demo"
  -- and the historical double-encoded variant alike. No account is deactivated;
  -- only the status label is normalised to "Active".
  UPDATE "Account" SET "status" = 'Active' WHERE "status" LIKE 'Active%Demo%';
