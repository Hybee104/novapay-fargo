-- CreateTable
CREATE TABLE "InternalTransfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transferReference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceAccountId" TEXT NOT NULL,
    "destinationAccountId" TEXT NOT NULL,
    "sourceTransactionId" TEXT NOT NULL,
    "destinationTransactionId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InternalTransfer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InternalTransfer_sourceAccountId_fkey" FOREIGN KEY ("sourceAccountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InternalTransfer_destinationAccountId_fkey" FOREIGN KEY ("destinationAccountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InternalTransfer_sourceTransactionId_fkey" FOREIGN KEY ("sourceTransactionId") REFERENCES "Transaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InternalTransfer_destinationTransactionId_fkey" FOREIGN KEY ("destinationTransactionId") REFERENCES "Transaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentReference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "status" TEXT NOT NULL DEFAULT 'Active — Demo',
    "balance" DECIMAL NOT NULL DEFAULT 650000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("accountNumber", "balance", "createdAt", "currency", "id", "routingNumber", "status", "type", "updatedAt", "userId") SELECT "accountNumber", "balance", "createdAt", "currency", "id", "routingNumber", "status", "type", "updatedAt", "userId" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_accountNumber_key" ON "Account"("accountNumber");
CREATE INDEX "Account_userId_bank_idx" ON "Account"("userId", "bank");
CREATE TABLE "new_BalanceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bank" TEXT NOT NULL DEFAULT 'NOVAPAY',
    "date" DATETIME NOT NULL,
    "balance" DECIMAL NOT NULL,
    CONSTRAINT "BalanceHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BalanceHistory" ("balance", "date", "id", "userId") SELECT "balance", "date", "id", "userId" FROM "BalanceHistory";
DROP TABLE "BalanceHistory";
ALTER TABLE "new_BalanceHistory" RENAME TO "BalanceHistory";
CREATE INDEX "BalanceHistory_userId_bank_date_idx" ON "BalanceHistory"("userId", "bank", "date");
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bank" TEXT NOT NULL DEFAULT 'NOVAPAY',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'system',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("createdAt", "id", "message", "read", "title", "type", "userId") SELECT "createdAt", "id", "message", "read", "title", "type", "userId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE INDEX "Notification_userId_bank_read_idx" ON "Notification"("userId", "bank", "read");
CREATE TABLE "new_SupportConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bank" TEXT NOT NULL DEFAULT 'NOVAPAY',
    "subject" TEXT NOT NULL,
    "agentName" TEXT NOT NULL DEFAULT 'Sarah — Northstar Support',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupportConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SupportConversation" ("agentName", "createdAt", "id", "status", "subject", "updatedAt", "userId") SELECT "agentName", "createdAt", "id", "status", "subject", "updatedAt", "userId" FROM "SupportConversation";
DROP TABLE "SupportConversation";
ALTER TABLE "new_SupportConversation" RENAME TO "SupportConversation";
CREATE INDEX "SupportConversation_userId_bank_updatedAt_idx" ON "SupportConversation"("userId", "bank", "updatedAt");
CREATE TABLE "new_SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketReference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bank" TEXT NOT NULL DEFAULT 'NOVAPAY',
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SupportTicket" ("category", "createdAt", "description", "id", "priority", "status", "subject", "ticketReference", "updatedAt", "userId") SELECT "category", "createdAt", "description", "id", "priority", "status", "subject", "ticketReference", "updatedAt", "userId" FROM "SupportTicket";
DROP TABLE "SupportTicket";
ALTER TABLE "new_SupportTicket" RENAME TO "SupportTicket";
CREATE UNIQUE INDEX "SupportTicket_ticketReference_key" ON "SupportTicket"("ticketReference");
CREATE INDEX "SupportTicket_userId_bank_createdAt_idx" ON "SupportTicket"("userId", "bank", "createdAt");
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bank" TEXT NOT NULL DEFAULT 'NOVAPAY',
    "transactionReference" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "recipientName" TEXT NOT NULL,
    "recipientReference" TEXT,
    "recipientEmail" TEXT,
    "description" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL,
    "runningBalance" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "category", "createdAt", "currency", "description", "id", "recipientEmail", "recipientName", "recipientReference", "runningBalance", "status", "transactionReference", "type", "updatedAt", "userId") SELECT "amount", "category", "createdAt", "currency", "description", "id", "recipientEmail", "recipientName", "recipientReference", "runningBalance", "status", "transactionReference", "type", "updatedAt", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_transactionReference_key" ON "Transaction"("transactionReference");
CREATE INDEX "Transaction_userId_bank_createdAt_idx" ON "Transaction"("userId", "bank", "createdAt");
CREATE INDEX "Transaction_userId_bank_status_idx" ON "Transaction"("userId", "bank", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "InternalTransfer_transferReference_key" ON "InternalTransfer"("transferReference");

-- CreateIndex
CREATE UNIQUE INDEX "InternalTransfer_sourceTransactionId_key" ON "InternalTransfer"("sourceTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "InternalTransfer_destinationTransactionId_key" ON "InternalTransfer"("destinationTransactionId");

-- CreateIndex
CREATE INDEX "InternalTransfer_userId_createdAt_idx" ON "InternalTransfer"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentReference_key" ON "Payment"("paymentReference");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_userId_status_idx" ON "Payment"("userId", "status");

-- CreateIndex
CREATE INDEX "Payment_accountId_createdAt_idx" ON "Payment"("accountId", "createdAt");
