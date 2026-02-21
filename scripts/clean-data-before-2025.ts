/**
 * Script to clean database records created before December 31, 2025
 * 
 * Usage:
 *   npx tsx scripts/clean-data-before-2025.ts
 * 
 * WARNING: This will permanently delete data. Make sure you have a backup!
 */

import prisma from "../lib/prisma";

const CUTOFF_DATE = new Date("2025-12-31T23:59:59.999Z");

async function cleanDatabase() {
  console.log("🗑️  Starting database cleanup...");
  console.log(`📅 Deleting all records before: ${CUTOFF_DATE.toISOString()}`);
  console.log("");

  try {
    // Count records before deletion
    console.log("📊 Counting records to delete...");
    
    const counts = {
      accountTransactions: await prisma.accountTransaction.count({
        where: { createdAt: { lt: CUTOFF_DATE } },
      }),
      receivablePayments: await prisma.accountsReceivablePayment.count({
        where: { paidAt: { lt: CUTOFF_DATE } },
      }),
      receivables: await prisma.accountsReceivable.count({
        where: { createdAt: { lt: CUTOFF_DATE } },
      }),
      salePayments: await prisma.salePayment.count({
        where: { paidAt: { lt: CUTOFF_DATE } },
      }),
      saleItems: await prisma.saleItem.count({
        where: { sale: { createdAt: { lt: CUTOFF_DATE } } },
      }),
      sales: await prisma.sale.count({
        where: { createdAt: { lt: CUTOFF_DATE } },
      }),
      stockMovements: await prisma.stockMovement.count({
        where: { createdAt: { lt: CUTOFF_DATE } },
      }),
      expenses: await prisma.expense.count({
        where: { incurredAt: { lt: CUTOFF_DATE } },
      }),
      purchaseItems: await prisma.purchaseItem.count({
        where: { purchase: { createdAt: { lt: CUTOFF_DATE } } },
      }),
      purchases: await prisma.purchase.count({
        where: { createdAt: { lt: CUTOFF_DATE } },
      }),
    };

    console.log("\n📋 Records to delete:");
    console.log(`  - Account Transactions: ${counts.accountTransactions}`);
    console.log(`  - Receivable Payments: ${counts.receivablePayments}`);
    console.log(`  - Receivables: ${counts.receivables}`);
    console.log(`  - Sale Payments: ${counts.salePayments}`);
    console.log(`  - Sale Items: ${counts.saleItems}`);
    console.log(`  - Sales: ${counts.sales}`);
    console.log(`  - Stock Movements: ${counts.stockMovements}`);
    console.log(`  - Expenses: ${counts.expenses}`);
    console.log(`  - Purchase Items: ${counts.purchaseItems}`);
    console.log(`  - Purchases: ${counts.purchases}`);

    const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    if (totalRecords === 0) {
      console.log("\n✅ No records found to delete. Database is clean!");
      return;
    }

    console.log(`\n🔢 Total records to delete: ${totalRecords}`);
    console.log("\n⚠️  Starting deletion in 3 seconds...");
    
    // Wait 3 seconds to allow user to cancel
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete in transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      console.log("\n🗑️  Deleting records...");

      // 1. Delete Account Transactions related to payments/expenses/purchases
      console.log("  1️⃣  Deleting account transactions...");
      const deletedAccountTransactions = await tx.accountTransaction.deleteMany({
        where: { createdAt: { lt: CUTOFF_DATE } },
      });
      console.log(`     ✓ Deleted ${deletedAccountTransactions.count} account transactions`);

      // 2. Delete Receivable Payments
      console.log("  2️⃣  Deleting receivable payments...");
      const deletedReceivablePayments = await tx.accountsReceivablePayment.deleteMany({
        where: { paidAt: { lt: CUTOFF_DATE } },
      });
      console.log(`     ✓ Deleted ${deletedReceivablePayments.count} receivable payments`);

      // 3. Delete Receivables
      console.log("  3️⃣  Deleting receivables...");
      const deletedReceivables = await tx.accountsReceivable.deleteMany({
        where: { createdAt: { lt: CUTOFF_DATE } },
      });
      console.log(`     ✓ Deleted ${deletedReceivables.count} receivables`);

      // 4. Delete Sale Payments (cascade will handle bank transactions)
      console.log("  4️⃣  Deleting sale payments...");
      const deletedSalePayments = await tx.salePayment.deleteMany({
        where: { paidAt: { lt: CUTOFF_DATE } },
      });
      console.log(`     ✓ Deleted ${deletedSalePayments.count} sale payments`);

      // 5. Delete Sales (cascade will delete sale items)
      console.log("  5️⃣  Deleting sales...");
      const deletedSales = await tx.sale.deleteMany({
        where: { createdAt: { lt: CUTOFF_DATE } },
      });
      console.log(`     ✓ Deleted ${deletedSales.count} sales`);

      // 6. Delete Stock Movements
      console.log("  6️⃣  Deleting stock movements...");
      const deletedStockMovements = await tx.stockMovement.deleteMany({
        where: { createdAt: { lt: CUTOFF_DATE } },
      });
      console.log(`     ✓ Deleted ${deletedStockMovements.count} stock movements`);

      // 7. Delete Expenses
      console.log("  7️⃣  Deleting expenses...");
      const deletedExpenses = await tx.expense.deleteMany({
        where: { incurredAt: { lt: CUTOFF_DATE } },
      });
      console.log(`     ✓ Deleted ${deletedExpenses.count} expenses`);

      // 8. Delete Purchases (cascade will delete purchase items)
      console.log("  8️⃣  Deleting purchases...");
      const deletedPurchases = await tx.purchase.deleteMany({
        where: { createdAt: { lt: CUTOFF_DATE } },
      });
      console.log(`     ✓ Deleted ${deletedPurchases.count} purchases`);
    });

    console.log("\n✅ Database cleanup completed successfully!");
    console.log(`🎉 Deleted ${totalRecords} records in total`);

  } catch (error) {
    console.error("\n❌ Error during cleanup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanDatabase()
  .then(() => {
    console.log("\n👋 Done! Exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
