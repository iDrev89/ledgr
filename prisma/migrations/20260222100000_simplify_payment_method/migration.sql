-- Migrate existing rows: map removed methods to CASH or BANK_TRANSFER
UPDATE "sale_payment"
  SET "method" = 'BANK_TRANSFER'
  WHERE "method" IN ('DIGITAL_PAYMENT', 'CHECK', 'CREDIT_CARD');
UPDATE "sale_payment"
  SET "method" = 'CASH'
  WHERE "method" IN ('DEBIT_CARD', 'OTHER');

UPDATE "expense"
  SET "paymentMethod" = 'BANK_TRANSFER'
  WHERE "paymentMethod" IN ('DIGITAL_PAYMENT', 'CHECK', 'CREDIT_CARD');
UPDATE "expense"
  SET "paymentMethod" = 'CASH'
  WHERE "paymentMethod" IN ('DEBIT_CARD', 'OTHER');

UPDATE "purchase"
  SET "paymentMethod" = 'BANK_TRANSFER'
  WHERE "paymentMethod" IN ('DIGITAL_PAYMENT', 'CHECK', 'CREDIT_CARD');
UPDATE "purchase"
  SET "paymentMethod" = 'CASH'
  WHERE "paymentMethod" IN ('DEBIT_CARD', 'OTHER');

UPDATE "receivable_payment"
  SET "method" = 'BANK_TRANSFER'
  WHERE "method" IN ('DIGITAL_PAYMENT', 'CHECK', 'CREDIT_CARD');
UPDATE "receivable_payment"
  SET "method" = 'CASH'
  WHERE "method" IN ('DEBIT_CARD', 'OTHER');

-- Recreate the enum with only the two allowed values
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER');

-- Migrate columns to new enum type
ALTER TABLE "sale_payment"
  ALTER COLUMN "method" TYPE "PaymentMethod"
  USING "method"::text::"PaymentMethod";

ALTER TABLE "expense"
  ALTER COLUMN "paymentMethod" TYPE "PaymentMethod"
  USING "paymentMethod"::text::"PaymentMethod";

ALTER TABLE "purchase"
  ALTER COLUMN "paymentMethod" TYPE "PaymentMethod"
  USING "paymentMethod"::text::"PaymentMethod";

ALTER TABLE "receivable_payment"
  ALTER COLUMN "method" TYPE "PaymentMethod"
  USING "method"::text::"PaymentMethod";

-- Drop old enum
DROP TYPE "PaymentMethod_old";
