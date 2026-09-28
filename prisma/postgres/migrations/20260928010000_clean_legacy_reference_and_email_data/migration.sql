-- Data-only cleanup: remove legacy SIM- reference markers and placeholder
-- counterparty addresses that were visible to end users.
--
-- Safety notes:
--   * Only the reference prefix changes; the year and the random trailing code
--     are preserved, and those codes are unique, so no new unique-constraint
--     collision is possible (no NVP- prefixed rows exist beforehand).
--   * Transaction IDs, amounts, dates, statuses, descriptions, balances and all
--     foreign-key relationships are left untouched.
--   * recipientEmail is a nullable column; the UI already renders NULL as "-".
--   * Everything runs inside the implicit transaction that Prisma wraps each
--     migration in, so a failure rolls the whole file back.

-- 1. Transaction references: SIM-TXN-YYYY-XXXXXX -> NVP-TXN-YYYY-XXXXXX
UPDATE "Transaction"
   SET "transactionReference" = 'NVP-' || substr("transactionReference", 5)
 WHERE "transactionReference" LIKE 'SIM-%';

-- 2. Support ticket references: SIM-TKT-XXXXX -> NVP-TKT-XXXXX
UPDATE "SupportTicket"
   SET "ticketReference" = 'NVP-' || substr("ticketReference", 5)
 WHERE "ticketReference" LIKE 'SIM-%';

-- 3. Recipient account references: SIM-ACC-NNNNNN -> ACC-NNNNNN
UPDATE "Transaction"
   SET "recipientReference" = substr("recipientReference", 5)
 WHERE "recipientReference" LIKE 'SIM-%';

-- 4. Placeholder counterparty addresses -> NULL
UPDATE "Transaction"
   SET "recipientEmail" = NULL
 WHERE "recipientEmail" LIKE '%@example.com';
