-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "securityNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "biometricEnabled" BOOLEAN NOT NULL DEFAULT false,
    "transactionAlertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("biometricEnabled", "createdAt", "email", "firstName", "id", "lastName", "passwordHash", "phone", "securityNotificationsEnabled", "transactionAlertsEnabled", "twoFactorEnabled", "updatedAt") SELECT "biometricEnabled", "createdAt", "email", "firstName", "id", "lastName", "passwordHash", "phone", "securityNotificationsEnabled", "transactionAlertsEnabled", "twoFactorEnabled", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
