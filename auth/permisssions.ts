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
  sales: ["create", "read", "update", "delete"],
  products: ["create", "read", "update", "delete"],
  expenses: ["create", "read", "update", "delete"],
  reports: ["read"],
  inventory: ["create", "read", "update", "delete"],
  payroll: ["create", "read", "update", "delete"],
} as const;

export const accessControl = createAccessControl(statements);

export const user = accessControl.newRole({
  sales: ["create", "read"],
  products: ["read"],
  inventory: ["read"],
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
  sales: ["create", "read", "update", "delete"],
  products: ["create", "read", "update", "delete"],
  expenses: ["create", "read", "update", "delete"],
  reports: ["read"],
  inventory: ["create", "read", "update", "delete"],
  payroll: ["create", "read", "update", "delete"],
});
