import { PrismaClient } from "@/prisma/prisma-client";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Iniciando limpieza de la base de datos...\n");

  try {
    // El orden es CRÍTICO debido a las relaciones de claves foráneas
    // Eliminamos desde las tablas más dependientes hacia las más independientes

    console.log("⏳ Eliminando transacciones de cuentas...");
    await prisma.accountTransaction.deleteMany({});
    console.log("✅ AccountTransaction eliminado");

    console.log("⏳ Eliminando items de nómina...");
    await prisma.payrollRunItem.deleteMany({});
    console.log("✅ PayrollRunItem eliminado");

    console.log("⏳ Eliminando entradas de nómina...");
    await prisma.payrollEntry.deleteMany({});
    console.log("✅ PayrollEntry eliminado");

    console.log("⏳ Eliminando nóminas...");
    await prisma.payrollRun.deleteMany({});
    console.log("✅ PayrollRun eliminado");

    console.log("⏳ Eliminando pagos de cuentas por cobrar...");
    await prisma.accountsReceivablePayment.deleteMany({});
    console.log("✅ AccountsReceivablePayment eliminado");

    console.log("⏳ Eliminando cuentas por cobrar...");
    await prisma.accountsReceivable.deleteMany({});
    console.log("✅ AccountsReceivable eliminado");

    console.log("⏳ Eliminando pagos de ventas...");
    await prisma.salePayment.deleteMany({});
    console.log("✅ SalePayment eliminado");

    console.log("⏳ Eliminando items de ventas...");
    await prisma.saleItem.deleteMany({});
    console.log("✅ SaleItem eliminado");

    console.log("⏳ Eliminando ventas...");
    await prisma.sale.deleteMany({});
    console.log("✅ Sale eliminado");

    console.log("⏳ Eliminando items de gastos...");
    await prisma.expenseItem.deleteMany({});
    console.log("✅ ExpenseItem eliminado");

    console.log("⏳ Eliminando gastos...");
    await prisma.expense.deleteMany({});
    console.log("✅ Expense eliminado");

    console.log("⏳ Eliminando items de compras...");
    await prisma.purchaseItem.deleteMany({});
    console.log("✅ PurchaseItem eliminado");

    console.log("⏳ Eliminando compras...");
    await prisma.purchase.deleteMany({});
    console.log("✅ Purchase eliminado");

    console.log("⏳ Eliminando movimientos de inventario...");
    await prisma.stockMovement.deleteMany({});
    console.log("✅ StockMovement eliminado");

    console.log("⏳ Eliminando productos...");
    await prisma.product.deleteMany({});
    console.log("✅ Product eliminado");

    console.log("⏳ Eliminando categorías de productos...");
    await prisma.productCategory.deleteMany({});
    console.log("✅ ProductCategory eliminado");

    console.log("⏳ Eliminando categorías de gastos...");
    await prisma.expenseCategory.deleteMany({});
    console.log("✅ ExpenseCategory eliminado");

    console.log("⏳ Eliminando proveedores...");
    await prisma.supplier.deleteMany({});
    console.log("✅ Supplier eliminado");

    console.log("⏳ Eliminando clientes...");
    await prisma.customer.deleteMany({});
    console.log("✅ Customer eliminado");

    console.log("⏳ Eliminando cuentas financieras...");
    await prisma.financialAccount.deleteMany({});
    console.log("✅ FinancialAccount eliminado");

    // Resetear los contadores de autoincremento (solo para PostgreSQL)
    console.log("\n⏳ Reseteando contadores de autoincremento...");
    await prisma.$executeRaw`ALTER SEQUENCE sale_saleNumber_seq RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE purchase_purchaseNumber_seq RESTART WITH 1`;
    console.log("✅ Contadores reseteados");

    console.log("\n✅ ¡Base de datos limpiada exitosamente!");
    console.log("ℹ️  Los usuarios y sesiones se mantuvieron intactos.");
  } catch (error) {
    console.error("\n❌ Error al limpiar la base de datos:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

