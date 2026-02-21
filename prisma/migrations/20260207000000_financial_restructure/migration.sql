-- ============================================================
-- Financial Restructure Migration
-- Bank -> FinancialAccount, BankTransaction -> AccountTransaction
-- New: BusinessLine, Branch, UserBranch
-- Updated PaymentMethod enum values
-- ============================================================

-- 1. Create new enums
CREATE TYPE "AccountType" AS ENUM ('BANK', 'CASH_REGISTER', 'PETTY_CASH', 'DIGITAL_WALLET', 'CREDIT_LINE');
CREATE TYPE "AccountTransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER_OUT', 'TRANSFER_IN', 'ADJUSTMENT');

-- 2. Create organizational tables

CREATE TABLE "business_line" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "color" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "business_line_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "business_line_name_key" ON "business_line"("name");

CREATE TABLE "branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "branch_name_key" ON "branch"("name");

CREATE TABLE "user_branch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "role" TEXT,
    CONSTRAINT "user_branch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_branch_userId_branchId_key" ON "user_branch"("userId", "branchId");
ALTER TABLE "user_branch" ADD CONSTRAINT "user_branch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_branch" ADD CONSTRAINT "user_branch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Create financial_account table (replaces bank)

CREATE TABLE "financial_account" (
    "id" TEXT NOT NULL,
    "type" "AccountType" NOT NULL DEFAULT 'BANK',
    "name" TEXT NOT NULL,
    "accountNumber" TEXT,
    "institution" TEXT,
    "initialBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "financial_account_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "financial_account_name_key" ON "financial_account"("name");
CREATE INDEX "financial_account_active_idx" ON "financial_account"("active");
CREATE INDEX "financial_account_type_idx" ON "financial_account"("type");
CREATE INDEX "financial_account_branchId_idx" ON "financial_account"("branchId");
ALTER TABLE "financial_account" ADD CONSTRAINT "financial_account_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Migrate data from bank to financial_account
INSERT INTO "financial_account" ("id", "type", "name", "accountNumber", "active", "createdAt", "updatedAt")
SELECT "id", 'BANK'::"AccountType", "name", "accountNo", "active", "createdAt", "updatedAt"
FROM "bank";

-- 5. Create a default Cash Register if it doesn't exist
INSERT INTO "financial_account" ("id", "type", "name", "active", "isDefault", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'CASH_REGISTER'::"AccountType", 'Caja General', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "financial_account" WHERE "name" = 'Caja General');

-- 6. Create account_transaction table (replaces bank_transaction)

CREATE TABLE "account_transaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" "AccountTransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salePaymentId" TEXT,
    "receivablePaymentId" TEXT,
    "expenseId" TEXT,
    "purchaseId" TEXT,
    "relatedAccountId" TEXT,
    "transferPairId" TEXT,
    CONSTRAINT "account_transaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "account_transaction_salePaymentId_key" ON "account_transaction"("salePaymentId");
CREATE UNIQUE INDEX "account_transaction_receivablePaymentId_key" ON "account_transaction"("receivablePaymentId");
CREATE UNIQUE INDEX "account_transaction_expenseId_key" ON "account_transaction"("expenseId");
CREATE UNIQUE INDEX "account_transaction_purchaseId_key" ON "account_transaction"("purchaseId");
CREATE UNIQUE INDEX "account_transaction_transferPairId_key" ON "account_transaction"("transferPairId");
CREATE INDEX "account_transaction_accountId_transactionDate_idx" ON "account_transaction"("accountId", "transactionDate");
CREATE INDEX "account_transaction_type_idx" ON "account_transaction"("type");
ALTER TABLE "account_transaction" ADD CONSTRAINT "account_transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "financial_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_transaction" ADD CONSTRAINT "account_transaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "account_transaction" ADD CONSTRAINT "account_transaction_salePaymentId_fkey" FOREIGN KEY ("salePaymentId") REFERENCES "sale_payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "account_transaction" ADD CONSTRAINT "account_transaction_receivablePaymentId_fkey" FOREIGN KEY ("receivablePaymentId") REFERENCES "receivable_payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "account_transaction" ADD CONSTRAINT "account_transaction_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "account_transaction" ADD CONSTRAINT "account_transaction_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "account_transaction" ADD CONSTRAINT "account_transaction_relatedAccountId_fkey" FOREIGN KEY ("relatedAccountId") REFERENCES "financial_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. Migrate data from bank_transaction to account_transaction
INSERT INTO "account_transaction" (
    "id", "accountId", "type", "amount", "description", "reference",
    "transactionDate", "createdById", "createdAt", "updatedAt",
    "salePaymentId", "receivablePaymentId", "expenseId", "purchaseId",
    "relatedAccountId", "transferPairId"
)
SELECT
    "id", "bankId",
    CASE "type"::text
        WHEN 'INCOME' THEN 'INCOME'::"AccountTransactionType"
        WHEN 'EXPENSE' THEN 'EXPENSE'::"AccountTransactionType"
        WHEN 'TRANSFER_OUT' THEN 'TRANSFER_OUT'::"AccountTransactionType"
        WHEN 'TRANSFER_IN' THEN 'TRANSFER_IN'::"AccountTransactionType"
        WHEN 'ADJUSTMENT' THEN 'ADJUSTMENT'::"AccountTransactionType"
    END,
    "amount", "description", "reference",
    "transactionDate", "createdById", "createdAt", "updatedAt",
    "salePaymentId", "receivablePaymentId", "expenseId", "purchaseId",
    "relatedBankId", "transferPairId"
FROM "bank_transaction";

-- 8. Replace PaymentMethod enum (create new, migrate, swap)
-- PostgreSQL doesn't allow using new ADD VALUE values in the same transaction,
-- so we create a fresh enum, convert columns to TEXT, update values, then cast to the new enum.

CREATE TYPE "PaymentMethod_new" AS ENUM ('CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'DIGITAL_PAYMENT', 'CHECK', 'OTHER');

-- sale_payment.method: drop default, convert to TEXT, migrate, cast to new enum, restore default
ALTER TABLE "sale_payment" ALTER COLUMN "method" DROP DEFAULT;
ALTER TABLE "sale_payment" ALTER COLUMN "method" TYPE TEXT;
UPDATE "sale_payment" SET "method" = 'DEBIT_CARD' WHERE "method" = 'CARD';
UPDATE "sale_payment" SET "method" = 'BANK_TRANSFER' WHERE "method" = 'TRANSFER';
UPDATE "sale_payment" SET "method" = 'DIGITAL_PAYMENT' WHERE "method" = 'DIGITAL';
ALTER TABLE "sale_payment" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING "method"::"PaymentMethod_new";

-- expense.paymentMethod
ALTER TABLE "expense" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "expense" ALTER COLUMN "paymentMethod" TYPE TEXT;
UPDATE "expense" SET "paymentMethod" = 'DEBIT_CARD' WHERE "paymentMethod" = 'CARD';
UPDATE "expense" SET "paymentMethod" = 'BANK_TRANSFER' WHERE "paymentMethod" = 'TRANSFER';
UPDATE "expense" SET "paymentMethod" = 'DIGITAL_PAYMENT' WHERE "paymentMethod" = 'DIGITAL';
ALTER TABLE "expense" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING "paymentMethod"::"PaymentMethod_new";

-- purchase.paymentMethod
ALTER TABLE "purchase" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "purchase" ALTER COLUMN "paymentMethod" TYPE TEXT;
UPDATE "purchase" SET "paymentMethod" = 'DEBIT_CARD' WHERE "paymentMethod" = 'CARD';
UPDATE "purchase" SET "paymentMethod" = 'BANK_TRANSFER' WHERE "paymentMethod" = 'TRANSFER';
UPDATE "purchase" SET "paymentMethod" = 'DIGITAL_PAYMENT' WHERE "paymentMethod" = 'DIGITAL';
ALTER TABLE "purchase" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING "paymentMethod"::"PaymentMethod_new";

-- receivable_payment.method
ALTER TABLE "receivable_payment" ALTER COLUMN "method" DROP DEFAULT;
ALTER TABLE "receivable_payment" ALTER COLUMN "method" TYPE TEXT;
UPDATE "receivable_payment" SET "method" = 'DEBIT_CARD' WHERE "method" = 'CARD';
UPDATE "receivable_payment" SET "method" = 'BANK_TRANSFER' WHERE "method" = 'TRANSFER';
UPDATE "receivable_payment" SET "method" = 'DIGITAL_PAYMENT' WHERE "method" = 'DIGITAL';
ALTER TABLE "receivable_payment" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING "method"::"PaymentMethod_new";

-- Swap: drop old enum, rename new one
DROP TYPE "PaymentMethod";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";

-- 9. Update sale_payment: rename bankId -> accountId, make it reference financial_account
-- First drop old FK constraint if exists
ALTER TABLE "sale_payment" DROP CONSTRAINT IF EXISTS "sale_payment_bankId_fkey";
ALTER TABLE "sale_payment" RENAME COLUMN "bankId" TO "accountId";

-- Assign payments without accountId to Caja General
UPDATE "sale_payment" SET "accountId" = (
    SELECT "id" FROM "financial_account" WHERE "name" = 'Caja General' LIMIT 1
) WHERE "accountId" IS NULL;

-- Make accountId NOT NULL now that all rows have a value
ALTER TABLE "sale_payment" ALTER COLUMN "accountId" SET NOT NULL;
DROP INDEX IF EXISTS "sale_payment_bankId_idx";
CREATE INDEX "sale_payment_accountId_idx" ON "sale_payment"("accountId");
ALTER TABLE "sale_payment" ADD CONSTRAINT "sale_payment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "financial_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 10. Update expense: rename bankId -> accountId
ALTER TABLE "expense" DROP CONSTRAINT IF EXISTS "expense_bankId_fkey";
ALTER TABLE "expense" RENAME COLUMN "bankId" TO "accountId";
DROP INDEX IF EXISTS "expense_bankId_idx";
CREATE INDEX "expense_accountId_idx" ON "expense"("accountId");
ALTER TABLE "expense" ADD CONSTRAINT "expense_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "financial_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 11. Update purchase: rename bankId -> accountId
ALTER TABLE "purchase" DROP CONSTRAINT IF EXISTS "purchase_bankId_fkey";
ALTER TABLE "purchase" RENAME COLUMN "bankId" TO "accountId";
DROP INDEX IF EXISTS "purchase_bankId_idx";
CREATE INDEX "purchase_accountId_idx" ON "purchase"("accountId");
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "financial_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 12. Update receivable_payment: rename bankId -> accountId
ALTER TABLE "receivable_payment" DROP CONSTRAINT IF EXISTS "receivable_payment_bankId_fkey";
ALTER TABLE "receivable_payment" RENAME COLUMN "bankId" TO "accountId";
DROP INDEX IF EXISTS "receivable_payment_bankId_idx";
CREATE INDEX "receivable_payment_accountId_idx" ON "receivable_payment"("accountId");
ALTER TABLE "receivable_payment" ADD CONSTRAINT "receivable_payment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "financial_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 13. Add organizational columns to existing tables

-- Sale: branchId, businessLineId
ALTER TABLE "sale" ADD COLUMN IF NOT EXISTS "branchId" TEXT;
ALTER TABLE "sale" ADD COLUMN IF NOT EXISTS "businessLineId" TEXT;
CREATE INDEX IF NOT EXISTS "sale_branchId_idx" ON "sale"("branchId");
CREATE INDEX IF NOT EXISTS "sale_businessLineId_idx" ON "sale"("businessLineId");
ALTER TABLE "sale" ADD CONSTRAINT "sale_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sale" ADD CONSTRAINT "sale_businessLineId_fkey" FOREIGN KEY ("businessLineId") REFERENCES "business_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Expense: branchId, businessLineId
ALTER TABLE "expense" ADD COLUMN IF NOT EXISTS "branchId" TEXT;
ALTER TABLE "expense" ADD COLUMN IF NOT EXISTS "businessLineId" TEXT;
CREATE INDEX IF NOT EXISTS "expense_branchId_idx" ON "expense"("branchId");
CREATE INDEX IF NOT EXISTS "expense_businessLineId_idx" ON "expense"("businessLineId");
ALTER TABLE "expense" ADD CONSTRAINT "expense_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "expense" ADD CONSTRAINT "expense_businessLineId_fkey" FOREIGN KEY ("businessLineId") REFERENCES "business_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Purchase: branchId
ALTER TABLE "purchase" ADD COLUMN IF NOT EXISTS "branchId" TEXT;
CREATE INDEX IF NOT EXISTS "purchase_branchId_idx" ON "purchase"("branchId");
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Product: businessLineId
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "businessLineId" TEXT;
CREATE INDEX IF NOT EXISTS "product_businessLineId_idx" ON "product"("businessLineId");
ALTER TABLE "product" ADD CONSTRAINT "product_businessLineId_fkey" FOREIGN KEY ("businessLineId") REFERENCES "business_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 14. Create default records

-- Default Branch "Principal"
INSERT INTO "branch" ("id", "name", "code", "active", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'Principal', 'MAIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "branch" WHERE "name" = 'Principal');

-- Default BusinessLine "General"
INSERT INTO "business_line" ("id", "name", "code", "active", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'General', 'GEN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "business_line" WHERE "name" = 'General');

-- 15. Drop old tables (after data is migrated)
DROP TABLE IF EXISTS "bank_transaction";
DROP TABLE IF EXISTS "bank";

-- 16. Drop old enum (no longer used)
DROP TYPE IF EXISTS "BankTransactionType";

-- Note: We cannot easily remove old PaymentMethod enum values (CARD, TRANSFER, DIGITAL) in PostgreSQL
-- They will remain in the enum type but won't be used. This is a PostgreSQL limitation.
-- Prisma will handle this correctly since the schema only references the new values.
