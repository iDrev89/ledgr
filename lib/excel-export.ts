import { utils, writeFile } from "xlsx";
import type {
  PurchaseReportDataEnhanced,
  BusinessSummaryDataEnhanced,
  DateRange,
  DailySalesReportData,
} from "./types/reports";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Helper to format currency
const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

// Helper to format date
const formatDate = (date: Date): string => {
  return format(date, "PPP", { locale: es });
};

// Helper to convert Decimal to number
const toNumber = (value: any): number => {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  if (value.toString) return parseFloat(value.toString());
  return 0;
};

/**
 * Export Purchase Report to Excel
 */
export function exportPurchasesToExcel(
  data: PurchaseReportDataEnhanced,
  dateRange: DateRange,
) {
  // Create workbook
  const wb = utils.book_new();

  // Sheet 1: Summary with metrics
  const summaryData = [
    ["REPORTE DE COMPRAS"],
    [
      "Periodo:",
      `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`,
    ],
    [""],
    ["MÉTRICAS ACTUALES"],
    ["Total Compras", formatCurrency(data.metrics.current.totalPurchases)],
    ["Total Pagado", formatCurrency(data.metrics.current.totalPaid)],
    ["Saldo Pendiente", formatCurrency(data.metrics.current.balance)],
    ["Número de Compras", data.metrics.current.count],
    ["Compra Promedio", formatCurrency(data.metrics.current.average)],
    [""],
    ["COMPARATIVA PERIODO ANTERIOR"],
    [
      "Total Compras",
      formatCurrency(data.metrics.previous.totalPurchases),
      `${data.metrics.change.totalPurchases.toFixed(1)}%`,
    ],
    [
      "Total Pagado",
      formatCurrency(data.metrics.previous.totalPaid),
      `${data.metrics.change.totalPaid.toFixed(1)}%`,
    ],
    [
      "Saldo Pendiente",
      formatCurrency(data.metrics.previous.balance),
      `${data.metrics.change.balance.toFixed(1)}%`,
    ],
    [
      "Número de Compras",
      data.metrics.previous.count,
      `${data.metrics.change.count.toFixed(1)}%`,
    ],
    [
      "Compra Promedio",
      formatCurrency(data.metrics.previous.average),
      `${data.metrics.change.average.toFixed(1)}%`,
    ],
  ];

  const wsSummary = utils.aoa_to_sheet(summaryData);
  utils.book_append_sheet(wb, wsSummary, "Resumen");

  // Sheet 2: Detailed purchases
  const purchasesData = [
    [
      "Fecha",
      "N° Factura",
      "Proveedor",
      "Estado",
      "Subtotal",
      "Impuestos",
      "Total",
      "Pagado",
      "Saldo",
    ],
    ...data.purchases.map((p) => [
      formatDate(p.createdAt),
      p.invoiceNo || "-",
      p.supplier?.name || "-",
      p.status,
      formatCurrency(toNumber(p.subtotal)),
      formatCurrency(toNumber(p.taxTotal)),
      formatCurrency(toNumber(p.total)),
      formatCurrency(toNumber(p.totalPaid)),
      formatCurrency(toNumber(p.balance)),
    ]),
  ];

  const wsPurchases = utils.aoa_to_sheet(purchasesData);
  utils.book_append_sheet(wb, wsPurchases, "Detalle de Compras");

  // Sheet 3: By Supplier
  const supplierData = [
    ["Proveedor", "Total Compras", "Total Pagado", "Saldo", "Cantidad"],
    ...data.bySupplier.map((s) => [
      s.supplierName,
      formatCurrency(s.totalPurchases),
      formatCurrency(s.totalPaid),
      formatCurrency(s.balance),
      s.count,
    ]),
  ];

  // Solo agregar hoja de proveedores si hay datos
  if (data.bySupplier.length > 0) {
    const wsSupplier = utils.aoa_to_sheet(supplierData);
    utils.book_append_sheet(wb, wsSupplier, "Por Proveedor");
  }

  // Generate file
  const fileName = `reporte_compras_${format(new Date(), "yyyy-MM-dd_HHmmss")}.xlsx`;
  writeFile(wb, fileName);
}

/**
 * Export Business Summary to Excel
 */
export function exportBusinessSummaryToExcel(
  data: BusinessSummaryDataEnhanced,
  dateRange: DateRange,
) {
  // Create workbook
  const wb = utils.book_new();

  // Sheet 1: Summary with all metrics
  const summaryData = [
    ["RESUMEN DE NEGOCIO"],
    [
      "Periodo:",
      `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`,
    ],
    [""],
    ["INGRESOS"],
    ["", "Actual", "Anterior", "Cambio %"],
    [
      "Total Ventas",
      formatCurrency(data.metrics.revenue.current.total),
      formatCurrency(data.metrics.revenue.previous.total),
      `${data.metrics.revenue.change.total.toFixed(1)}%`,
    ],
    [
      "Número de Ventas",
      data.metrics.revenue.current.count,
      data.metrics.revenue.previous.count,
      `${data.metrics.revenue.change.count.toFixed(1)}%`,
    ],
    [
      "Ticket Promedio",
      formatCurrency(data.metrics.revenue.current.average),
      formatCurrency(data.metrics.revenue.previous.average),
      `${data.metrics.revenue.change.average.toFixed(1)}%`,
    ],
    [""],
    ["COSTOS"],
    ["", "Actual", "Anterior", "Cambio %"],
    [
      "Costo de Ventas",
      formatCurrency(data.metrics.costs.current.total),
      formatCurrency(data.metrics.costs.previous.total),
      `${data.metrics.costs.change.total.toFixed(1)}%`,
    ],
    [
      "Margen Bruto",
      formatCurrency(data.metrics.costs.current.grossProfit),
      formatCurrency(data.metrics.costs.previous.grossProfit),
      `${data.metrics.costs.change.grossProfit.toFixed(1)}%`,
    ],
    [
      "% Margen Bruto",
      `${data.metrics.costs.current.grossMargin.toFixed(1)}%`,
      `${data.metrics.costs.previous.grossMargin.toFixed(1)}%`,
      `${data.metrics.costs.change.grossMargin.toFixed(1)}%`,
    ],
    [""],
    ["GASTOS"],
    ["", "Actual", "Anterior", "Cambio %"],
    [
      "Total Gastos",
      formatCurrency(data.metrics.expenses.current.total),
      formatCurrency(data.metrics.expenses.previous.total),
      `${data.metrics.expenses.change.total.toFixed(1)}%`,
    ],
    [""],
    ["UTILIDAD"],
    ["", "Actual", "Anterior", "Cambio %"],
    [
      "Utilidad Neta",
      formatCurrency(data.metrics.profit.current.net),
      formatCurrency(data.metrics.profit.previous.net),
      `${data.metrics.profit.change.net.toFixed(1)}%`,
    ],
    [
      "% Margen Neto",
      `${data.metrics.profit.current.netMargin.toFixed(1)}%`,
      `${data.metrics.profit.previous.netMargin.toFixed(1)}%`,
      `${data.metrics.profit.change.netMargin.toFixed(1)}%`,
    ],
    [""],
    ["FLUJO DE EFECTIVO"],
    ["Efectivo Recibido", formatCurrency(data.cashFlow.cashReceived)],
    ["Efectivo Gastado", formatCurrency(data.cashFlow.cashSpent)],
    ["Balance Efectivo", formatCurrency(data.cashFlow.netCash)],
    [""],
    ["DESGLOSE POR CUENTA"],
    ["Cuenta", "Tipo", "Total"],
    ...(data.cashFlow.byAccount || []).map((a) => [
      a.accountName,
      a.accountType,
      formatCurrency(a.total),
    ]),
  ];

  const wsSummary = utils.aoa_to_sheet(summaryData);
  utils.book_append_sheet(wb, wsSummary, "Resumen");

  // Sheet 2: Top Products
  const productsData = [
    [
      "Producto",
      "Cantidad Vendida",
      "Ingresos",
      "Costo",
      "Utilidad",
      "% Margen",
    ],
    ...data.productPerformance.map((p) => [
      p.productName,
      p.quantitySold,
      formatCurrency(p.revenue),
      formatCurrency(p.cost),
      formatCurrency(p.profit),
      `${p.margin.toFixed(1)}%`,
    ]),
  ];

  const wsProducts = utils.aoa_to_sheet(productsData);
  utils.book_append_sheet(wb, wsProducts, "Productos");

  // Sheet 3: Top Customers
  const customersData = [
    ["Cliente", "Total Gastado", "Número de Compras"],
    ...data.topCustomers.map((c) => [
      c.customerName,
      formatCurrency(c.totalSpent),
      c.orderCount,
    ]),
  ];

  const wsCustomers = utils.aoa_to_sheet(customersData);
  utils.book_append_sheet(wb, wsCustomers, "Clientes");

  // Sheet 4: Expenses by Category
  const expensesData = [
    ["Categoría", "Total", "Porcentaje"],
    ...data.metrics.expenses.current.byCategory.map((c) => [
      c.categoryName,
      formatCurrency(c.total),
      `${c.percentage.toFixed(1)}%`,
    ]),
  ];

  const wsExpenses = utils.aoa_to_sheet(expensesData);
  utils.book_append_sheet(wb, wsExpenses, "Gastos por Categoría");

  // Sheet 5: Sales Detail
  const salesData = [
    ["N° Venta", "Fecha", "Cliente", "Total", "Items", "Vendedor"],
    ...data.details.salesBreakdown.map((s) => [
      String(s.saleNumber).padStart(4, "0"),
      formatDate(s.createdAt),
      s.customerName || "-",
      formatCurrency(s.total),
      s.itemCount,
      s.createdByName,
    ]),
  ];

  const wsSales = utils.aoa_to_sheet(salesData);
  utils.book_append_sheet(wb, wsSales, "Detalle de Ventas");

  // Sheet 6: Expenses Detail
  const expenseDetailData = [
    ["Fecha", "Descripción", "Monto", "Categoría", "Creado por"],
    ...data.details.expenseBreakdown.map((e) => [
      formatDate(e.incurredAt),
      e.description,
      formatCurrency(e.amount),
      e.categoryName || "-",
      e.createdByName,
    ]),
  ];

  const wsExpenseDetail = utils.aoa_to_sheet(expenseDetailData);
  utils.book_append_sheet(wb, wsExpenseDetail, "Detalle de Gastos");

  // Generate file
  const fileName = `resumen_negocio_${format(new Date(), "yyyy-MM-dd_HHmmss")}.xlsx`;
  writeFile(wb, fileName);
}

/**
 * Export Daily Sales Report to Excel
 */
export function exportDailySalesToExcel(
  data: DailySalesReportData,
  date: Date,
) {
  // Create workbook
  const wb = utils.book_new();

  // Sheet 1: Summary with metrics
  const summaryData = [
    ["REPORTE DE VENTAS DIARIAS"],
    ["Fecha:", formatDate(date)],
    [""],
    ["MÉTRICAS DEL DÍA"],
    ["Total Ventas", formatCurrency(data.metrics.totalSales)],
    ["Número de Ventas", data.metrics.salesCount],
    ["Venta Promedio", formatCurrency(data.metrics.averageTicket)],
    ["Total Pagado", formatCurrency(data.metrics.totalPaid)],
    ["Saldo Pendiente", formatCurrency(data.metrics.pendingBalance)],
    [""],
    ["INGRESOS POR CUENTA"],
    ["Cuenta", "Tipo", "Total"],
    ...(data.metrics.byAccount || []).map((a) => [
      a.accountName,
      a.accountType,
      formatCurrency(a.total),
    ]),
  ];

  const wsSummary = utils.aoa_to_sheet(summaryData);
  utils.book_append_sheet(wb, wsSummary, "Resumen");

  // Sheet 2: Detailed sales
  const salesData = [
    [
      "N° Venta",
      "Fecha",
      "Hora",
      "Cliente",
      "Vendedor",
      "Items",
      "Total",
      "Métodos de Pago",
      "Estado de Pago",
    ],
    ...data.sales.map((s) => {
      const paymentStatusLabels = {
        paid: "Pagado",
        partial: "Parcial",
        pending: "Pendiente",
      };

      const paymentMethodLabels: Record<string, string> = {
        CASH: "Efectivo",
        BANK_TRANSFER: "Transferencia",
      };

      const methodsText = s.paymentMethods && s.paymentMethods.length > 0
        ? s.paymentMethods.map((m) => paymentMethodLabels[m] || m).join(", ")
        : "-";

      return [
        String(s.saleNumber).padStart(4, "0"),
        format(s.createdAt, "dd/MM/yyyy"),
        format(s.createdAt, "HH:mm"),
        s.customerName || "-",
        s.soldByName || "-",
        s.itemCount,
        formatCurrency(toNumber(s.total)),
        methodsText,
        paymentStatusLabels[s.paymentStatus],
      ];
    }),
  ];

  const wsSales = utils.aoa_to_sheet(salesData);
  utils.book_append_sheet(wb, wsSales, "Detalle de Ventas");

  // Generate file
  const fileName = `ventas_diarias_${format(date, "yyyy-MM-dd")}_${format(new Date(), "HHmmss")}.xlsx`;
  writeFile(wb, fileName);
}
