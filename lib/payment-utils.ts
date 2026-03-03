import { PaymentMethod, AccountType } from "@/prisma/prisma-client";
import type { FinancialAccount } from "@/prisma/prisma-client";

export const getPaymentMethodLabel = (
  method: PaymentMethod | string,
  t?: (key: string) => string,
): string => {
  const labels: Record<string, string> = {
    CASH: t ? t("paymentCash") : "Efectivo",
    BANK_TRANSFER: t ? t("paymentBankTransfer") : "Transferencia",
  };
  return labels[method] || method;
};

export const getPaymentMethodBadgeVariant = (
  method: PaymentMethod | string,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (method) {
    case "CASH":
      return "default";
    case "BANK_TRANSFER":
      return "outline";
    default:
      return "default";
  }
};

export const getAccountTypeLabel = (
  type: AccountType | string,
  t?: (key: string) => string,
): string => {
  const labels: Record<string, string> = {
    BANK: t ? t("typeBank") : "Banco",
    CASH_REGISTER: t ? t("typeCashRegister") : "Caja",
    PETTY_CASH: t ? t("typePettyCash") : "Caja Chica",
    DIGITAL_WALLET: t ? t("typeDigitalWallet") : "Billetera Digital",
    CREDIT_LINE: t ? t("typeCreditLine") : "Crédito",
  };
  return labels[type] || type;
};

export const getDefaultAccountForMethod = (
  method: PaymentMethod | string,
  accounts: FinancialAccount[],
): string | undefined => {
  const defaultAccount = accounts.find((a) => a.isDefault);

  switch (method) {
    case "CASH":
      return (
        accounts.find((a) => a.type === "CASH_REGISTER")?.id ||
        defaultAccount?.id
      );
    case "BANK_TRANSFER":
      return (
        accounts.find((a) => a.type === "BANK")?.id || defaultAccount?.id
      );
    default:
      return defaultAccount?.id;
  }
};

export const getAccountsForMethod = (
  method: PaymentMethod | string,
  accounts: FinancialAccount[],
): FinancialAccount[] => {
  switch (method) {
    case "CASH":
      return accounts.filter((a) => a.type === "CASH_REGISTER");
    case "BANK_TRANSFER":
      return accounts.filter((a) => a.type !== "CASH_REGISTER");
    default:
      return accounts;
  }
};
