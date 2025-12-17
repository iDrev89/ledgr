import {
  PayrollEntry,
  PayrollRun,
  PayrollRunItem,
} from "@/prisma/prisma-client";

export type { PayrollEntry, PayrollRun, PayrollRunItem };

export type PayrollEntryWithDetails = Omit<PayrollEntry, "amount"> & {
  amount: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  run?: {
    id: string;
    periodLabel: string;
    status: string;
  } | null;
};

export type PayrollRunItemWithDetails = Omit<
  PayrollRunItem,
  | "commissionsTotal"
  | "advancesTotal"
  | "adjustmentsTotal"
  | "salaryFixed"
  | "payableTotal"
  | "paidAmount"
  | "balance"
> & {
  commissionsTotal: string;
  advancesTotal: string;
  adjustmentsTotal: string;
  salaryFixed: string | null;
  payableTotal: string;
  paidAmount: string;
  balance: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type PayrollRunWithDetails = PayrollRun & {
  items: PayrollRunItemWithDetails[];
  entries?: PayrollEntryWithDetails[];
  _count?: {
    items: number;
    entries: number;
  };
};

export type PayrollRunSummary = {
  id: string;
  periodLabel: string;
  periodType: string;
  startDate: Date;
  endDate: Date;
  status: string;
  totalPayable: string;
  totalPaid: string;
  totalBalance: string;
  employeeCount: number;
  createdAt: Date;
  updatedAt: Date;
};
