-- CreateEnum
CREATE TYPE "CashSessionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "cash_session" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "branchId" TEXT,
    "status" "CashSessionStatus" NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedById" TEXT NOT NULL,
    "openingBalance" DECIMAL(12,2) NOT NULL,
    "openingNotes" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "expectedBalance" DECIMAL(12,2),
    "actualBalance" DECIMAL(12,2),
    "difference" DECIMAL(12,2),
    "retainedAmount" DECIMAL(12,2),
    "depositAmount" DECIMAL(12,2),
    "depositAccountId" TEXT,
    "closingNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cash_session_accountId_status_idx" ON "cash_session"("accountId", "status");

-- CreateIndex
CREATE INDEX "cash_session_branchId_idx" ON "cash_session"("branchId");

-- AddForeignKey
ALTER TABLE "cash_session" ADD CONSTRAINT "cash_session_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "financial_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_session" ADD CONSTRAINT "cash_session_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_session" ADD CONSTRAINT "cash_session_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_session" ADD CONSTRAINT "cash_session_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_session" ADD CONSTRAINT "cash_session_depositAccountId_fkey" FOREIGN KEY ("depositAccountId") REFERENCES "financial_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "cash_register_close" DROP CONSTRAINT IF EXISTS "cash_register_close_accountId_fkey";

-- DropForeignKey
ALTER TABLE "cash_register_close" DROP CONSTRAINT IF EXISTS "cash_register_close_branchId_fkey";

-- DropForeignKey
ALTER TABLE "cash_register_close" DROP CONSTRAINT IF EXISTS "cash_register_close_closedById_fkey";

-- DropTable
DROP TABLE IF EXISTS "cash_register_close";
