import { createAccessControl } from "better-auth/plugins/access";
const statements = {
  users: [
    "create",
    "read",
    "update",
    "delete",
    "ban",
    "set-role",
    "impersonate",
  ],
  customers: ["create", "read", "update", "delete"],
  sales: ["create", "read", "update", "delete"],
  products: ["create", "read", "update", "delete"],
  suppliers: ["create", "read", "update", "delete"],
  purchases: ["create", "read", "update", "delete"],
  expenses: ["create", "read", "update", "delete"],
  reports: ["read"],
  inventory: ["create", "read", "update", "delete"],
  receivables: ["create", "read", "update", "delete"],
  banks: ["create", "read", "update", "delete"],
  payroll: ["create", "read", "update", "delete"],
  dashboard: ["read"],
} as const;

export const accessControl = createAccessControl(statements);

export const user = accessControl.newRole({
  customers: ["create"], // Puede crear clientes en formularios pero no ver la página de clientes
  sales: ["create", "read"],
  purchases: ["create", "read"], // Puede crear y ver compras
  inventory: ["read"], // Puede ver inventario pero no productos
});
export const admin = accessControl.newRole({
  users: [
    "create",
    "read",
    "update",
    "delete",
    "ban",
    "set-role",
    "impersonate",
  ],
  customers: ["create", "read", "update", "delete"],
  sales: ["create", "read", "update", "delete"],
  products: ["create", "read", "update", "delete"],
  suppliers: ["create", "read", "update", "delete"],
  purchases: ["create", "read", "update", "delete"],
  expenses: ["create", "read", "update", "delete"],
  reports: ["read"],
  inventory: ["create", "read", "update", "delete"],
  receivables: ["create", "read", "update", "delete"],
  banks: ["create", "read", "update", "delete"],
  payroll: ["create", "read", "update", "delete"],
  dashboard: ["read"],
});
