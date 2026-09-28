-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "status" SET DEFAULT 'Active';

-- Normalise any Account rows still carrying the legacy label. The predicate is
-- deliberately encoding-agnostic so it matches "Active - Demo", "Active — Demo"
-- and the historical double-encoded variant alike. No account is deactivated;
-- only the status label is normalised to "Active".
UPDATE "Account" SET "status" = 'Active' WHERE "status" LIKE 'Active%Demo%';
