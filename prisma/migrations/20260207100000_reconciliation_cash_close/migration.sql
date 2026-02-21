-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable: cash_register_close
CREATE TABLE "cash_register_close" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "branchId" TEXT,
    "closeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedBalance" DECIMAL(12,2) NOT NULL,
    "actualBalance" DECIMAL(12,2) NOT NULL,
    "difference" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "closedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_register_close_pkey" PRIMARY KEY ("id")
);

-- CreateTable: account_reconciliation
CREATE TABLE "account_reconciliation" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "openingBalance" DECIMAL(12,2) NOT NULL,
    "closingBalance" DECIMAL(12,2) NOT NULL,
    "statementBalance" DECIMAL(12,2) NOT NULL,
    "difference" DECIMAL(12,2) NOT NULL,
    "status" "ReconciliationStatus" NOT NULL DEFAULT 'DRAFT',
    "reconciledAt" TIMESTAMP(3),
    "reconciledById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_reconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable: reconciliation_item
CREATE TABLE "reconciliation_item" (
    "id" TEXT NOT NULL,
    "reconciliationId" TEXT NOT NULL,
    "transactionId" TEXT,
    "externalRef" TEXT,
    "externalAmount" DECIMAL(12,2),
    "externalDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'UNMATCHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cash_register_close_accountId_closeDate_idx" ON "cash_register_close"("accountId", "closeDate");
CREATE INDEX "cash_register_close_branchId_idx" ON "cash_register_close"("branchId");

CREATE INDEX "account_reconciliation_accountId_periodStart_idx" ON "account_reconciliation"("accountId", "periodStart");
CREATE INDEX "account_reconciliation_status_idx" ON "account_reconciliation"("status");

CREATE INDEX "reconciliation_item_reconciliationId_idx" ON "reconciliation_item"("reconciliationId");
CREATE INDEX "reconciliation_item_transactionId_idx" ON "reconciliation_item"("transactionId");

-- AddForeignKey
ALTER TABLE "cash_register_close" ADD CONSTRAINT "cash_register_close_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "financial_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cash_register_close" ADD CONSTRAINT "cash_register_close_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cash_register_close" ADD CONSTRAINT "cash_register_close_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "account_reconciliation" ADD CONSTRAINT "account_reconciliation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "financial_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_reconciliation" ADD CONSTRAINT "account_reconciliation_reconciledById_fkey" FOREIGN KEY ("reconciledById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reconciliation_item" ADD CONSTRAINT "reconciliation_item_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "account_reconciliation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reconciliation_item" ADD CONSTRAINT "reconciliation_item_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "account_transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
