# Ledgr - Implementation Plan

## Overview

This document outlines the complete implementation plan for Ledgr, a comprehensive business management SaaS platform. The implementation is divided into 5 phases, each building upon the previous one.

---

## Database Schema Summary

### Core Models

- **User** - Authentication and user management (with Better Auth)
- **Customer** - Customer catalog
- **Supplier** - Supplier catalog
- **Product** - Products and Services (with ProductType enum)

### Sales Module

- **Sale** - Sales records linked to User and Customer
- **SaleItem** - Line items for each sale
- **AccountsReceivable** - Accounts receivable (debtors)
- **AccountsReceivablePayment** - Payments towards receivables

### Expense Module

- **Expense** - Expense records
- **ExpenseItem** - Expense line items
- **ExpenseCategory** - Hierarchical expense categories

### Inventory & Purchasing

- **Purchase** - Purchase orders
- **PurchaseItem** - Purchase line items
- **PurchasePayment** - Payments for purchases
- **StockMovement** - Inventory movement log

### Payroll

- **PayrollEntry** - Commissions, salaries, advances, adjustments

---

## Phase 1 - Daily Operations (MVP)

### Goal

Enable daily sales and expense tracking with basic reporting dashboard.

### Models Used

- User (existing)
- Customer
- Product
- Sale + SaleItem
- Expense + ExpenseItem + ExpenseCategory
- Supplier

### Features to Implement

#### 1.1 Customer Management

**Frontend Components:**

- `app/customers/page.tsx` - Customer list with search and filters
- `components/customers/customer-form.tsx` - Create/edit customer form
- `components/customers/customer-table.tsx` - Data table with actions
- `components/customers/customer-details.tsx` - Customer detail view

**Backend API Routes:**

- `POST /api/customers` - Create customer
- `GET /api/customers` - List customers (with pagination, search)
- `GET /api/customers/[id]` - Get customer details
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer (soft delete if has sales)

**Validations:**

```typescript
// lib/validations/customer.ts
customerSchema = {
  name: required, min 2 chars
  email: optional, valid email
  phone: optional, valid phone
  docId: optional, string
  note: optional, max 500 chars
}
```

#### 1.2 Product/Service Catalog

**Frontend Components:**

- `app/products/page.tsx` - Product list with type filter (PRODUCT/SERVICE)
- `components/products/product-form.tsx` - Create/edit product form
- `components/products/product-table.tsx` - Data table with stock indicator
- `components/products/product-card.tsx` - Product card view
- `components/products/product-type-toggle.tsx` - Toggle PRODUCT/SERVICE

**Backend API Routes:**

- `POST /api/products` - Create product
- `GET /api/products` - List products (filter by type, active status)
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `PATCH /api/products/[id]/toggle` - Toggle active status

**Validations:**

```typescript
// lib/validations/product.ts
productSchema = {
  type: enum [PRODUCT, SERVICE]
  sku: optional, unique
  name: required, min 2 chars
  description: optional, max 1000 chars
  price: required, positive decimal
  cost: optional, positive decimal
  active: boolean
}
```

#### 1.3 Sales Module

**Frontend Components:**

- `app/sales/page.tsx` - Sales list and overview
- `app/sales/new/page.tsx` - Create new sale
- `app/sales/[id]/page.tsx` - Sale detail view
- `components/sales/sale-form.tsx` - Multi-step sale form
- `components/sales/sale-item-row.tsx` - Sale item input row
- `components/sales/sale-summary.tsx` - Calculation summary
- `components/sales/sale-table.tsx` - Sales data table
- `components/sales/payment-method-select.tsx` - Payment method selector

**Backend API Routes:**

- `POST /api/sales` - Create sale (with items)
- `GET /api/sales` - List sales (filter by date, customer, user)
- `GET /api/sales/[id]` - Get sale details with items
- `GET /api/sales/stats` - Sales statistics for dashboard
- `DELETE /api/sales/[id]` - Cancel sale (admin only)

**Business Logic:**

```typescript
// Sale creation flow:
1. Validate customer exists
2. Validate all products exist and are active
3. Calculate line totals: (unitPrice - discount) * quantity
4. Calculate subtotal: sum of all line totals
5. Calculate taxTotal: subtotal * tax rate
6. Calculate total: subtotal - discountTotal + taxTotal
7. Create Sale record with createdById = current user
8. Create SaleItem records
9. If product type = PRODUCT, create StockMovement (SALE, negative quantity)
10. Return created sale with items
```

**Validations:**

```typescript
// lib/validations/sale.ts
saleSchema = {
  customerId: required, valid UUID
  currency: default "COP"
  paymentMethod: enum [CASH, CARD, TRANSFER, DIGITAL, OTHER]
  note: optional, max 500 chars
  items: array, min 1 item, each:
    - productId: required, valid UUID
    - quantity: required, positive integer
    - unitPrice: required, positive decimal
    - discount: optional, non-negative decimal
}
```

#### 1.4 Expense Management

**Frontend Components:**

- `app/expenses/page.tsx` - Expense list and overview
- `app/expenses/new/page.tsx` - Create new expense
- `app/expenses/[id]/page.tsx` - Expense detail view
- `components/expenses/expense-form.tsx` - Expense form with items
- `components/expenses/expense-table.tsx` - Expenses data table
- `components/expenses/expense-category-tree.tsx` - Hierarchical category selector
- `components/expenses/supplier-select.tsx` - Supplier dropdown with create

**Backend API Routes:**

- `POST /api/expenses` - Create expense
- `GET /api/expenses` - List expenses (filter by date, category, supplier)
- `GET /api/expenses/[id]` - Get expense details
- `GET /api/expenses/stats` - Expense statistics
- `POST /api/expense-categories` - Create category
- `GET /api/expense-categories` - List categories (tree structure)
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers` - List suppliers

**Validations:**

```typescript
// lib/validations/expense.ts
expenseSchema = {
  categoryId: optional, valid UUID
  supplierId: optional, valid UUID
  description: optional, max 1000 chars
  invoiceNo: optional, string
  attachment: optional, file URL
  currency: default "COP"
  amount: required, positive decimal
  incurredAt: date, default now
  items: optional array, each:
    - categoryId: optional
    - description: optional
    - quantity: positive decimal
    - unitAmount: positive decimal
    - taxPercent: 0-100
}
```

#### 1.5 Dashboard

**Frontend Components:**

- `app/dashboard/page.tsx` - Main dashboard (role-specific views)
- `components/dashboard/revenue-card.tsx` - Total revenue metric
- `components/dashboard/expense-card.tsx` - Total expenses metric
- `components/dashboard/profit-card.tsx` - Net profit metric
- `components/dashboard/sales-chart.tsx` - Sales over time chart
- `components/dashboard/expense-chart.tsx` - Expenses by category chart
- `components/dashboard/recent-sales.tsx` - Recent sales list
- `components/dashboard/top-products.tsx` - Top selling products
- `components/dashboard/user-activity.tsx` - Activity by collaborator (admin only)

**Backend API Routes:**

- `GET /api/dashboard/metrics` - Key metrics (revenue, expenses, profit)
- `GET /api/dashboard/sales-trend` - Sales data for charts (daily/weekly/monthly)
- `GET /api/dashboard/expense-breakdown` - Expenses by category
- `GET /api/dashboard/top-products` - Top selling products
- `GET /api/dashboard/user-activity` - Sales/expenses by user (admin only)

**Metrics Calculations:**

```typescript
// Period-based metrics (today, week, month, custom range)
- Total Revenue: SUM(Sale.total) WHERE createdAt IN period
- Total Expenses: SUM(Expense.amount) WHERE incurredAt IN period
- Net Profit: Total Revenue - Total Expenses
- Sales Count: COUNT(Sale) WHERE createdAt IN period
- Average Sale: AVG(Sale.total)
- Top Customers: GROUP BY customerId, ORDER BY SUM(total) DESC
- Top Products: GROUP BY productId, ORDER BY SUM(quantity) DESC
```

### i18n Keys Required

```json
// messages/en.json & es.json
{
  "customers": {
    "title": "Customers",
    "create": "Create Customer",
    "edit": "Edit Customer",
    "name": "Name",
    "email": "Email",
    "phone": "Phone",
    "docId": "Document ID"
  },
  "products": {
    "title": "Products & Services",
    "create": "Create Product",
    "type": "Type",
    "product": "Product",
    "service": "Service",
    "sku": "SKU",
    "price": "Price",
    "cost": "Cost"
  },
  "sales": {
    "title": "Sales",
    "newSale": "New Sale",
    "customer": "Customer",
    "paymentMethod": "Payment Method",
    "subtotal": "Subtotal",
    "discount": "Discount",
    "tax": "Tax",
    "total": "Total"
  },
  "expenses": {
    "title": "Expenses",
    "newExpense": "New Expense",
    "category": "Category",
    "supplier": "Supplier",
    "amount": "Amount",
    "invoiceNo": "Invoice #"
  },
  "dashboard": {
    "title": "Dashboard",
    "revenue": "Revenue",
    "expenses": "Expenses",
    "profit": "Net Profit",
    "salesChart": "Sales Trend"
  }
}
```

### Testing Checklist

- [ ] Customer CRUD operations
- [ ] Product CRUD with type filter
- [ ] Sale creation with multiple items
- [ ] Sale calculation (subtotal, discount, tax, total)
- [ ] Stock movement on product sale
- [ ] Expense creation with categories
- [ ] Dashboard metrics calculation
- [ ] Role-based access (admin vs collaborator)
- [ ] i18n switching (EN/ES)

---

## Phase 2 - Payroll & Financial Reports

### Goal

Automate commission and salary calculations, generate period-based financial reports.

### Models Used

- PayrollEntry
- All Phase 1 models

### Features to Implement

#### 2.1 Commission Rules Configuration

**Frontend Components:**

- `app/settings/commissions/page.tsx` - Commission rules setup
- `components/payroll/commission-rule-form.tsx` - Rule configuration form
- `components/payroll/commission-preview.tsx` - Preview commission calculation

**Backend API Routes:**

- `POST /api/payroll/commission-rules` - Create commission rule
- `GET /api/payroll/commission-rules` - List rules
- `PUT /api/payroll/commission-rules/[id]` - Update rule

**Commission Rule Structure:**

```typescript
// Stored as JSON configuration
type CommissionRule = {
  userId?: string; // null = applies to all
  productType?: ProductType; // null = all types
  percentage: number; // 0-100
  minAmount?: number; // minimum sale amount to apply
  priority: number; // rule priority
};
```

#### 2.2 Payroll Management

**Frontend Components:**

- `app/payroll/page.tsx` - Payroll overview by period
- `app/payroll/[period]/page.tsx` - Period detail view
- `components/payroll/payroll-summary.tsx` - Period summary by user
- `components/payroll/payroll-entry-form.tsx` - Manual entry form
- `components/payroll/commission-breakdown.tsx` - Commission detail breakdown
- `components/payroll/payroll-export.tsx` - Export to Excel

**Backend API Routes:**

- `POST /api/payroll/calculate` - Calculate commissions for period
- `GET /api/payroll` - List periods
- `GET /api/payroll/[period]` - Get period details
- `POST /api/payroll/entries` - Create manual entry (salary, advance, adjustment)
- `GET /api/payroll/user/[userId]` - User payroll history

**Business Logic:**

```typescript
// Commission calculation for period (e.g., "2025-10" or "2025-W40")
1. Get all sales for period WHERE createdById = userId
2. For each sale:
   - Apply commission rules based on priority
   - Calculate commission: sale.total * rule.percentage / 100
3. Create PayrollEntry records:
   - kind = "COMMISSION"
   - amount = calculated commission
   - description = "Commission from sale #[saleId]"
4. Allow manual entries for:
   - kind = "SALARY" (fixed salary)
   - kind = "ADVANCE" (advance payment)
   - kind = "ADJUSTMENT" (corrections)
```

#### 2.3 Income Statement (Estado de Resultados)

**Frontend Components:**

- `app/reports/income-statement/page.tsx` - Income statement report
- `components/reports/income-statement-table.tsx` - Formatted report table
- `components/reports/period-selector.tsx` - Date range selector
- `components/reports/comparison-view.tsx` - Period comparison

**Backend API Routes:**

- `GET /api/reports/income-statement` - Generate income statement

**Report Structure:**

```typescript
type IncomeStatement = {
  period: { start: Date; end: Date };
  revenue: {
    totalSales: number;
    salesByType: { product: number; service: number };
  };
  costOfGoodsSold: {
    totalCost: number; // sum of product costs from sales
    grossProfit: number; // revenue - COGS
    grossMargin: number; // (grossProfit / revenue) * 100
  };
  operatingExpenses: {
    byCategory: { categoryName: string; amount: number }[];
    total: number;
  };
  payroll: {
    commissions: number;
    salaries: number;
    total: number;
  };
  netIncome: number; // revenue - COGS - expenses - payroll
  netMargin: number; // (netIncome / revenue) * 100
};
```

### i18n Keys Required

```json
{
  "payroll": {
    "title": "Payroll",
    "period": "Period",
    "commissions": "Commissions",
    "salaries": "Salaries",
    "advances": "Advances",
    "adjustments": "Adjustments",
    "total": "Total Payroll",
    "calculate": "Calculate Commissions"
  },
  "reports": {
    "incomeStatement": "Income Statement",
    "revenue": "Revenue",
    "costOfGoodsSold": "Cost of Goods Sold",
    "grossProfit": "Gross Profit",
    "operatingExpenses": "Operating Expenses",
    "netIncome": "Net Income"
  }
}
```

### Testing Checklist

- [ ] Commission calculation accuracy
- [ ] Manual payroll entries (salary, advance, adjustment)
- [ ] Period-based payroll summary
- [ ] Income statement generation
- [ ] Period comparison
- [ ] Multiple commission rules per user

---

## Phase 3 - Inventory & Accounts Receivable

### Goal

Implement stock control with alerts and manage customer debts with payment tracking.

### Models Used

- StockMovement
- AccountsReceivable
- AccountsReceivablePayment
- Purchase + PurchaseItem + PurchasePayment

### Features to Implement

#### 3.1 Inventory Management

**Frontend Components:**

- `app/inventory/page.tsx` - Inventory overview with stock levels
- `app/inventory/movements/page.tsx` - Movement history
- `app/inventory/adjustments/page.tsx` - Manual adjustments
- `components/inventory/stock-table.tsx` - Current stock by product
- `components/inventory/stock-alert-badge.tsx` - Low stock indicator
- `components/inventory/movement-log.tsx` - Movement history log
- `components/inventory/adjustment-form.tsx` - Manual adjustment form

**Backend API Routes:**

- `GET /api/inventory` - Current stock levels (calculated from movements)
- `GET /api/inventory/movements` - Movement history
- `POST /api/inventory/adjustments` - Create manual adjustment
- `GET /api/inventory/alerts` - Products with low stock

**Business Logic:**

```typescript
// Current stock calculation (per product)
1. Get all StockMovement WHERE productId = id
2. Calculate:
   - Purchases: SUM(quantity) WHERE moveType = PURCHASE
   - Sales: SUM(quantity) WHERE moveType = SALE
   - Adjustments: SUM(quantity) WHERE moveType = ADJUSTMENT
   - Current Stock = Purchases - Sales + Adjustments
3. Calculate average cost:
   - Weighted average from PURCHASE movements

// Low stock alert
- Define minStock threshold per product (new field in Product model)
- Alert when current stock < minStock
```

**Product Model Update:**

```typescript
// Add to Product model
model Product {
  // ... existing fields
  minStock     Int?     // minimum stock alert threshold
  currentStock Int?     // denormalized for performance (optional)
}
```

#### 3.2 Purchase Orders

**Frontend Components:**

- `app/purchases/page.tsx` - Purchase order list
- `app/purchases/new/page.tsx` - Create purchase order
- `app/purchases/[id]/page.tsx` - Purchase detail with payment history
- `components/purchases/purchase-form.tsx` - Multi-step purchase form
- `components/purchases/purchase-status-badge.tsx` - Status indicator
- `components/purchases/purchase-payment-form.tsx` - Record payment
- `components/purchases/receive-form.tsx` - Receive items form

**Backend API Routes:**

- `POST /api/purchases` - Create purchase order (status = DRAFT)
- `GET /api/purchases` - List purchases (filter by status, supplier)
- `GET /api/purchases/[id]` - Get purchase details
- `PATCH /api/purchases/[id]/status` - Update status
- `POST /api/purchases/[id]/receive` - Receive items (creates stock movements)
- `POST /api/purchases/[id]/payments` - Record payment

**Purchase Flow:**

```typescript
// Purchase lifecycle
1. DRAFT: Initial creation, can be edited
2. APPROVED: Approved by admin, ready to order
3. RECEIVED: Items received, create StockMovement records
4. CLOSED: Fully paid
5. CANCELED: Canceled before receiving

// When status changes to RECEIVED:
1. For each PurchaseItem:
   - Create StockMovement:
     - moveType = PURCHASE
     - quantity = item.quantity
     - unitCost = item.unitCost
     - refType = "PURCHASE"
     - refId = purchase.id
2. Update product.cost with weighted average
```

#### 3.3 Accounts Receivable (AR)

**Frontend Components:**

- `app/receivables/page.tsx` - Receivables overview
- `app/receivables/[id]/page.tsx` - Receivable detail with payment history
- `components/receivables/receivable-table.tsx` - Receivables data table
- `components/receivables/receivable-status-badge.tsx` - Status badge
- `components/receivables/payment-form.tsx` - Record payment form
- `components/receivables/aging-report.tsx` - Aging analysis (30/60/90 days)

**Backend API Routes:**

- `POST /api/receivables` - Create receivable (manual or from sale)
- `GET /api/receivables` - List receivables (filter by status, customer)
- `GET /api/receivables/[id]` - Get receivable details
- `POST /api/receivables/[id]/payments` - Record payment
- `GET /api/receivables/aging` - Aging report

**Business Logic:**

```typescript
// Create receivable from sale (during sale creation)
- If paymentMethod = "OTHER" or customer requests credit:
  - Create AccountsReceivable:
    - customerId = sale.customerId
    - saleId = sale.id
    - total = sale.total
    - balance = sale.total
    - status = OPEN

// Record payment
1. Validate amount <= receivable.balance
2. Create AccountsReceivablePayment
3. Update receivable.balance = balance - payment.amount
4. Update status:
   - balance = 0 → PAID
   - balance < total → PARTIAL
   - balance = total → OPEN

// Aging report
- Group receivables by days overdue:
  - Current (0-30 days)
  - 30-60 days
  - 60-90 days
  - 90+ days
- Calculate total balance per group
```

### i18n Keys Required

```json
{
  "inventory": {
    "title": "Inventory",
    "currentStock": "Current Stock",
    "movements": "Movements",
    "adjustment": "Adjustment",
    "lowStock": "Low Stock Alert",
    "minStock": "Minimum Stock"
  },
  "purchases": {
    "title": "Purchases",
    "newPurchase": "New Purchase",
    "status": {
      "draft": "Draft",
      "approved": "Approved",
      "received": "Received",
      "closed": "Closed",
      "canceled": "Canceled"
    },
    "receive": "Receive Items",
    "recordPayment": "Record Payment"
  },
  "receivables": {
    "title": "Accounts Receivable",
    "balance": "Balance",
    "aging": "Aging Report",
    "current": "Current",
    "overdue": "Overdue",
    "recordPayment": "Record Payment"
  }
}
```

### Testing Checklist

- [ ] Stock calculation accuracy
- [ ] Stock movements on purchase receive
- [ ] Low stock alerts
- [ ] Purchase order lifecycle
- [ ] Weighted average cost calculation
- [ ] Receivable creation from sale
- [ ] Payment recording and balance update
- [ ] Aging report calculation

---

## Phase 4 - Advanced Financial Reports

### Goal

Generate comprehensive financial reports with export capabilities (PDF/Excel).

### Features to Implement

#### 4.1 Cash Flow Statement

**Frontend Components:**

- `app/reports/cash-flow/page.tsx` - Cash flow statement
- `components/reports/cash-flow-table.tsx` - Formatted report

**Backend API Routes:**

- `GET /api/reports/cash-flow` - Generate cash flow statement

**Report Structure:**

```typescript
type CashFlowStatement = {
  period: { start: Date; end: Date };
  operatingActivities: {
    cashFromSales: number;
    cashFromReceivables: number; // payments received
    cashPaidToSuppliers: number; // purchase payments
    cashPaidForExpenses: number;
    cashPaidForPayroll: number;
    netOperatingCash: number;
  };
  investingActivities: {
    // Future: equipment purchases, etc.
    netInvestingCash: number;
  };
  financingActivities: {
    // Future: loans, equity, etc.
    netFinancingCash: number;
  };
  netCashFlow: number;
  openingBalance: number;
  closingBalance: number;
};
```

#### 4.2 Balance Sheet

**Frontend Components:**

- `app/reports/balance-sheet/page.tsx` - Balance sheet report
- `components/reports/balance-sheet-table.tsx` - Formatted report

**Backend API Routes:**

- `GET /api/reports/balance-sheet` - Generate balance sheet

**Report Structure:**

```typescript
type BalanceSheet = {
  asOfDate: Date;
  assets: {
    currentAssets: {
      cash: number; // from cash flow
      accountsReceivable: number; // total AR balance
      inventory: number; // sum of (stock * cost)
      total: number;
    };
    total: number;
  };
  liabilities: {
    currentLiabilities: {
      accountsPayable: number; // unpaid purchases
      total: number;
    };
    total: number;
  };
  equity: {
    retainedEarnings: number; // cumulative net income
    currentPeriodIncome: number;
    total: number;
  };
  totalLiabilitiesAndEquity: number;
};
```

#### 4.3 Report Export

**Frontend Components:**

- `components/reports/export-button.tsx` - Export dropdown (PDF/Excel)

**Backend API Routes:**

- `GET /api/reports/export/[type]` - Export report to PDF or Excel

**Implementation:**

```typescript
// Libraries to use:
- PDF: jsPDF or Puppeteer (server-side)
- Excel: exceljs or xlsx

// Export flow:
1. Generate report data
2. Format according to export type
3. Return file as download
```

#### 4.4 Custom Reports

**Frontend Components:**

- `app/reports/custom/page.tsx` - Custom report builder
- `components/reports/report-builder.tsx` - Drag-and-drop report builder
- `components/reports/saved-reports.tsx` - Saved custom reports

**Features:**

- Date range selection
- Metric selection (revenue, expenses, profit, etc.)
- Grouping (by customer, product, category, user)
- Filtering
- Save and schedule reports

### i18n Keys Required

```json
{
  "reports": {
    "cashFlow": "Cash Flow Statement",
    "balanceSheet": "Balance Sheet",
    "customReport": "Custom Report",
    "export": "Export",
    "exportPdf": "Export to PDF",
    "exportExcel": "Export to Excel",
    "operatingActivities": "Operating Activities",
    "investingActivities": "Investing Activities",
    "financingActivities": "Financing Activities",
    "assets": "Assets",
    "liabilities": "Liabilities",
    "equity": "Equity"
  }
}
```

### Testing Checklist

- [ ] Cash flow statement accuracy
- [ ] Balance sheet accuracy
- [ ] PDF export
- [ ] Excel export
- [ ] Custom report builder
- [ ] Report scheduling

---

## Phase 5 - Scaling & Integrations (Optional)

### Goal

Scale the platform with mobile app, POS integration, and third-party services.

### Features to Implement

#### 5.1 Mobile App

**Tech Stack:**

- React Native or Flutter
- Same API endpoints
- Offline-first with sync

**Features:**

- Quick sale entry
- Expense recording
- Photo upload (receipts, invoices)
- Push notifications
- Barcode scanning

#### 5.2 POS Integration

**Frontend Components:**

- `app/pos/page.tsx` - POS interface
- `components/pos/cash-register.tsx` - Cash register UI
- `components/pos/receipt-printer.tsx` - Receipt printing
- `components/pos/barcode-scanner.tsx` - Barcode scanner integration

**Features:**

- Barcode/QR code scanning
- Receipt printing
- Cash drawer integration
- Payment terminal integration

#### 5.3 Notifications

**Frontend Components:**

- `app/settings/notifications/page.tsx` - Notification preferences
- `components/notifications/notification-center.tsx` - In-app notifications

**Backend:**

- Email notifications (Resend, SendGrid)
- SMS notifications (Twilio)
- Push notifications (Firebase)

**Notification Types:**

- Low stock alerts
- Payment reminders
- Report ready
- New sale (for admin)

#### 5.4 Payment Gateway Integration

**Supported Gateways:**

- Stripe
- Nequi (Colombia)
- MercadoPago (Latin America)
- Wompi (Colombia)

**Implementation:**

```typescript
// Payment flow:
1. User selects payment gateway
2. Create payment intent
3. Redirect to gateway
4. Receive webhook confirmation
5. Update sale/receivable status
6. Send receipt
```

#### 5.5 Accounting Software Integration

**Integrations:**

- QuickBooks
- Xero
- Alegra (Colombia)

**Sync Features:**

- Export sales as invoices
- Export expenses
- Import chart of accounts
- Sync customers and suppliers

#### 5.6 Multi-Company Support

**Database Changes:**

```typescript
// Add Company/Tenant model
model Company {
  id          String   @id @default(cuid())
  name        String
  taxId       String?
  plan        String   // free, basic, pro, enterprise
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())

  users       User[]
  customers   Customer[]
  products    Product[]
  sales       Sale[]
  // ... all other entities
}

// Update User model
model User {
  // ... existing fields
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
}
```

**Implementation:**

- Row-level security (RLS) by companyId
- Company selection on login
- Separate data per company
- Consolidated reporting across companies (enterprise plan)

### i18n Keys Required

```json
{
  "mobile": {
    "quickSale": "Quick Sale",
    "scanBarcode": "Scan Barcode"
  },
  "pos": {
    "title": "Point of Sale",
    "cashRegister": "Cash Register",
    "printReceipt": "Print Receipt"
  },
  "notifications": {
    "title": "Notifications",
    "lowStock": "Low Stock",
    "paymentReminder": "Payment Reminder",
    "preferences": "Notification Preferences"
  },
  "integrations": {
    "title": "Integrations",
    "paymentGateways": "Payment Gateways",
    "accounting": "Accounting Software",
    "connect": "Connect",
    "disconnect": "Disconnect"
  }
}
```

### Testing Checklist

- [ ] Mobile app sync
- [ ] Barcode scanning
- [ ] Receipt printing
- [ ] Email notifications
- [ ] Push notifications
- [ ] Payment gateway webhooks
- [ ] Accounting software sync
- [ ] Multi-company isolation

---

## Technical Implementation Guidelines

### API Structure

```
app/api/
├── auth/
├── customers/
│   ├── route.ts (GET, POST)
│   └── [id]/
│       └── route.ts (GET, PUT, DELETE)
├── products/
│   ├── route.ts (GET, POST)
│   └── [id]/
│       ├── route.ts (GET, PUT, DELETE)
│       └── toggle/
│           └── route.ts (PATCH)
├── sales/
│   ├── route.ts (GET, POST)
│   ├── [id]/
│   │   └── route.ts (GET, DELETE)
│   └── stats/
│       └── route.ts (GET)
├── expenses/
├── purchases/
├── inventory/
├── receivables/
├── payroll/
├── reports/
└── dashboard/
```

### State Management

- React Query for server state
- Zustand for client state (optional)
- Form state with React Hook Form

### Validation

- Zod schemas for all forms
- Server-side validation on all endpoints
- Client-side validation for UX

### Error Handling

```typescript
// Standard error response
type ErrorResponse = {
  error: string;
  message: string;
  details?: Record<string, string[]>;
};

// Usage
if (!customer) {
  return NextResponse.json(
    { error: "NOT_FOUND", message: "Customer not found" },
    { status: 404 },
  );
}
```

### Authentication & Authorization

```typescript
// Protect API routes
import { auth } from "@/auth/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Authentication required" },
      { status: 401 },
    );
  }

  // Check permissions
  if (!hasPermission(session.user, "sales.read")) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Insufficient permissions" },
      { status: 403 },
    );
  }

  // Continue with logic...
}
```

### Performance Optimization

- Implement pagination on all list endpoints
- Add database indexes (already in schema)
- Cache dashboard metrics (Redis or similar)
- Lazy load components
- Virtual scrolling for large lists
- Debounce search inputs

### Testing Strategy

```typescript
// Unit tests: Business logic
// Integration tests: API routes
// E2E tests: Critical flows

// Example test structure
describe("Sales API", () => {
  describe("POST /api/sales", () => {
    it("creates sale with items and stock movements", async () => {
      // Test implementation
    });

    it("returns 400 if invalid data", async () => {
      // Test implementation
    });

    it("returns 403 if user lacks permission", async () => {
      // Test implementation
    });
  });
});
```

---

## Deployment Strategy

### Infrastructure

- **Frontend**: Vercel
- **Database**: Supabase or AWS RDS PostgreSQL
- **File Storage**: S3 or Cloudflare R2
- **Cache**: Redis (Upstash)
- **CDN**: Cloudflare

### Environment Variables

```bash
# Database
DATABASE_URL=

# Auth (Better Auth)
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email
RESEND_API_KEY=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=

# Payments (Phase 5)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Feature Flags
ENABLE_MOBILE_APP=false
ENABLE_POS=false
ENABLE_INTEGRATIONS=false
```

### CI/CD Pipeline

```yaml
# .github/workflows/main.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## Migration Strategy

### From Excel to Ledgr

1. **Data Export**: Export current Excel data to CSV
2. **Data Mapping**: Map Excel columns to Ledgr models
3. **Import Script**: Create seeding script for initial data
4. **Validation**: Verify imported data accuracy
5. **Training**: Train users on new system
6. **Parallel Run**: Run both systems for 1-2 weeks
7. **Full Migration**: Switch to Ledgr completely

### Import Script Example

```typescript
// scripts/import-from-excel.ts
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import fs from "fs";

const prisma = new PrismaClient();

async function importCustomers() {
  const csvData = fs.readFileSync("./data/customers.csv", "utf-8");
  const records = parse(csvData, { columns: true });

  for (const record of records) {
    await prisma.customer.create({
      data: {
        name: record.name,
        email: record.email,
        phone: record.phone,
        docId: record.docId,
      },
    });
  }
}

// Similar functions for products, sales, etc.
```

---

## Success Metrics

### Phase 1 KPIs

- Time to record a sale: < 2 minutes
- Daily active users
- Number of sales recorded
- Dashboard load time: < 2 seconds

### Phase 2 KPIs

- Payroll calculation accuracy: 100%
- Time to generate income statement: < 5 seconds

### Phase 3 KPIs

- Inventory accuracy: > 98%
- AR collection rate improvement
- Stock-out incidents reduction

### Phase 4 KPIs

- Report generation time: < 10 seconds
- Export success rate: > 99%

### Phase 5 KPIs

- Mobile app adoption rate
- Integration sync success rate
- Multi-company system performance

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building Ledgr from MVP to a full-featured business management SaaS platform. Each phase builds upon the previous one, allowing for iterative development and continuous value delivery.

**Next Steps:**

1. Set up development environment
2. Run database migrations
3. Start Phase 1 implementation with Customer Management
4. Follow test-driven development approach
5. Deploy to staging after each feature
6. Gather user feedback continuously
7. Iterate and improve
