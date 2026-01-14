/**
 * Script to fix SaleItems with null performedById
 * 
 * This script will:
 * 1. Find all SaleItems where performedById is null
 * 2. Set performedById to the soldById (or createdById if soldById is null) from the parent Sale
 * 
 * Usage:
 *   npx tsx scripts/fix-sale-items-performed-by.ts
 */

import prisma from "../lib/prisma";

async function fixSaleItemsPerformedBy() {
  console.log("🔧 Starting SaleItems performedById fix...");
  console.log("");

  try {
    // 1. Count SaleItems with null performedById
    console.log("📊 Analyzing SaleItems...");
    
    const totalNullPerformedBy = await prisma.saleItem.count({
      where: { performedById: null },
    });

    console.log(`\n📋 Found ${totalNullPerformedBy} SaleItems with null performedById`);

    if (totalNullPerformedBy === 0) {
      console.log("\n✅ All SaleItems already have performedById assigned!");
      return;
    }

    // 2. Get all SaleItems with null performedById including related data
    console.log("\n🔍 Fetching SaleItems details...");
    
    const saleItemsToFix = await prisma.saleItem.findMany({
      where: { performedById: null },
      include: {
        sale: {
          select: {
            id: true,
            saleNumber: true,
            soldById: true,
            createdById: true,
          },
        },
      },
    });

    console.log(`   Found ${saleItemsToFix.length} items to update`);

    // 3. Group by sale for better reporting
    const salesMap = new Map<string, {
      saleNumber: number;
      soldById: string | null;
      createdById: string;
      itemCount: number;
    }>();

    for (const item of saleItemsToFix) {
      const sale = item.sale;
      if (!salesMap.has(sale.id)) {
        salesMap.set(sale.id, {
          saleNumber: sale.saleNumber,
          soldById: sale.soldById,
          createdById: sale.createdById,
          itemCount: 0,
        });
      }
      const saleData = salesMap.get(sale.id)!;
      saleData.itemCount++;
    }

    console.log(`\n📦 Affecting ${salesMap.size} sales`);
    console.log("\n🔄 Sales to be updated:");
    
    for (const [saleId, data] of salesMap.entries()) {
      const performerId = data.soldById || data.createdById;
      console.log(`   Sale #${data.saleNumber}: ${data.itemCount} items → Assign to User: ${performerId}`);
    }

    console.log("\n⚠️  Starting update in 3 seconds...");
    console.log("   Press Ctrl+C to cancel");
    
    // Wait 3 seconds to allow user to cancel
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      console.log("\n🔧 Updating SaleItems...");
      
      let updatedCount = 0;

      for (const item of saleItemsToFix) {
        const sale = item.sale;
        const performerId = sale.soldById || sale.createdById;

        await tx.saleItem.update({
          where: { id: item.id },
          data: {
            performedById: performerId,
          },
        });

        updatedCount++;

        // Log progress every 10 items
        if (updatedCount % 10 === 0) {
          console.log(`   Updated ${updatedCount}/${saleItemsToFix.length} items...`);
        }
      }

      return { updatedCount };
    });

    console.log(`\n✅ Update completed successfully!`);
    console.log(`   📝 Total items updated: ${result.updatedCount}`);

    // 5. Verify the fix
    console.log("\n🔍 Verifying fix...");
    
    const remainingNullPerformedBy = await prisma.saleItem.count({
      where: { performedById: null },
    });

    if (remainingNullPerformedBy === 0) {
      console.log("   ✅ All SaleItems now have performedById assigned!");
    } else {
      console.log(`   ⚠️  Warning: ${remainingNullPerformedBy} items still have null performedById`);
    }

  } catch (error) {
    console.error("\n❌ Error during fix:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixSaleItemsPerformedBy()
  .then(() => {
    console.log("\n👋 Done! Exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
