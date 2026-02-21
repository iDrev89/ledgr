import { PaymentMethod, AccountType } from "@/prisma/prisma-client";
import type { FinancialAccount } from "@/prisma/prisma-client";

export const getPaymentMethodLabel = (
  method: PaymentMethod | string,
  t?: (key: string) => string,
): string => {
  const labels: Record<string, string> = {
    CASH: t ? t("paymentCash") : "Efectivo",
    DEBIT_CARD: t ? t("paymentDebitCard") : "T. Débito",
    CREDIT_CARD: t ? t("paymentCreditCard") : "T. Crédito",
    BANK_TRANSFER: t ? t("paymentBankTransfer") : "Transferencia",
    DIGITAL_PAYMENT: t ? t("paymentDigitalPayment") : "Pago Digital",
    CHECK: t ? t("paymentCheck") : "Cheque",
    OTHER: t ? t("paymentOther") : "Otro",
  };
  return labels[method] || method;
};

export const getPaymentMethodBadgeVariant = (
  method: PaymentMethod | string,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (method) {
    case "CASH":
      return "default";
    case "DEBIT_CARD":
    case "CREDIT_CARD":
      return "secondary";
    case "BANK_TRANSFER":
    case "DIGITAL_PAYMENT":
      return "outline";
    case "CHECK":
      return "secondary";
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
    case "DEBIT_CARD":
    case "CREDIT_CARD":
    case "BANK_TRANSFER":
      return (
        accounts.find((a) => a.type === "BANK")?.id || defaultAccount?.id
      );
    case "DIGITAL_PAYMENT":
      return (
        accounts.find((a) => a.type === "DIGITAL_WALLET")?.id ||
        defaultAccount?.id
      );
    case "CHECK":
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
  return accounts;
};
