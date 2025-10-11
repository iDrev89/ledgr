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
  expenses: ["create", "read", "update", "delete"],
  reports: ["read"],
  inventory: ["create", "read", "update", "delete"],
  receivables: ["create", "read", "update", "delete"],
  banks: ["create", "read", "update", "delete"],
  payroll: ["create", "read", "update", "delete"],
} as const;

export const accessControl = createAccessControl(statements);

export const user = accessControl.newRole({
  customers: ["create", "read", "update"],
  sales: ["create", "read"],
  products: ["read"],
  inventory: ["read"],
  receivables: ["read"],
  banks: ["read"],
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
  expenses: ["create", "read", "update", "delete"],
  reports: ["read"],
  inventory: ["create", "read", "update", "delete"],
  receivables: ["create", "read", "update", "delete"],
  banks: ["create", "read", "update", "delete"],
  payroll: ["create", "read", "update", "delete"],
});
