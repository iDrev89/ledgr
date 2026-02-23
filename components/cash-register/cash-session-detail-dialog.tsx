"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { CashSessionWithRelations } from "@/lib/types/cash-session";
import { cn } from "@/lib/utils";

const formatCurrency = (value: string | null) => {
  if (!value) return "-";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
};

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

interface CashSessionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: CashSessionWithRelations | null;
}

export const CashSessionDetailDialog = ({
  open,
  onOpenChange,
  session,
}: CashSessionDetailDialogProps) => {
  const t = useTranslations("CashRegister");

  if (!session) return null;

  const isOpen = session.status === "OPEN";
  const diff = session.difference ? parseFloat(session.difference) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("sessionDetail")}
            <Badge variant={isOpen ? "default" : "secondary"}>
              {isOpen ? t("statusOpen") : t("statusClosed")}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("openCash")}
            </h4>
            <div className="rounded-md border px-3 py-1">
              <Row label={t("account")} value={session.account.name} mono={false} />
              {session.branch && (
                <Row label={t("branch")} value={session.branch.name} mono={false} />
              )}
              <Row label={t("openedBy")} value={session.openedBy.name} mono={false} />
              <Row label={t("openedAt")} value={formatDate(session.openedAt)} mono={false} />
              <Row
                label={t("openingBalance")}
                value={formatCurrency(session.openingBalance)}
              />
              {session.openingNotes && (
                <Row label={t("openingNotes")} value={session.openingNotes} mono={false} />
              )}
            </div>
          </div>

          {!isOpen && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("closeCash")}
                </h4>
                <div className="rounded-md border px-3 py-1">
                  <Row
                    label={t("closedBy")}
                    value={session.closedBy?.name ?? "-"}
                    mono={false}
                  />
                  <Row
                    label={t("closedAt")}
                    value={formatDate(session.closedAt)}
                    mono={false}
                  />
                  <Row
                    label={t("expectedBalance")}
                    value={formatCurrency(session.expectedBalance)}
                  />
                  <Row
                    label={t("actualBalance")}
                    value={formatCurrency(session.actualBalance)}
                  />
                  <Row
                    label={t("difference")}
                    value={formatCurrency(session.difference)}
                    valueClassName={
                      diff === null || diff === 0
                        ? "text-success"
                        : diff < 0
                          ? "text-destructive"
                          : "text-warning"
                    }
                  />
                  <Row
                    label={t("retainedAmount")}
                    value={formatCurrency(session.retainedAmount)}
                  />
                  <Row
                    label={t("depositAmount")}
                    value={formatCurrency(session.depositAmount)}
                  />
                  {session.depositAccount && (
                    <Row
                      label={t("depositAccount")}
                      value={session.depositAccount.name}
                      mono={false}
                    />
                  )}
                  {session.closingNotes && (
                    <Row
                      label={t("closingNotes")}
                      value={session.closingNotes}
                      mono={false}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Row = ({
  label,
  value,
  valueClassName,
  mono = true,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  mono?: boolean;
}) => (
  <div className="flex items-start justify-between gap-4 py-1.5 border-b border-border/40 last:border-0">
    <span className="text-muted-foreground shrink-0 text-sm">{label}</span>
    <span
      className={cn(
        "text-right font-medium text-sm",
        mono && "font-mono tabular-nums",
        valueClassName,
      )}
    >
      {value}
    </span>
  </div>
);
