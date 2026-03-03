"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  ArrowRightLeft,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReconciliation,
  useCompleteReconciliation,
  useUpdateReconciliationItem,
} from "@/hooks/use-reconciliation";
import type {
  ReconciliationWithRelations,
  ReconciliationItemWithRelations,
} from "@/lib/types/reconciliation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

interface ReconciliationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reconciliation: ReconciliationWithRelations | null;
  locale?: string;
}

const formatCurrency = (value: unknown) => {
  const numValue = Number(value);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(numValue);
};

const itemStatusVariant = (status: string) => {
  switch (status) {
    case "MATCHED":
      return "default" as const;
    case "IGNORED":
      return "outline" as const;
    case "CREATED":
      return "secondary" as const;
    default:
      return "destructive" as const;
  }
};

const itemStatusClassName = (status: string) => {
  switch (status) {
    case "MATCHED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "UNMATCHED":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "IGNORED":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    case "CREATED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    default:
      return "";
  }
};

const reconciliationStatusClassName = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "IN_PROGRESS":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "DRAFT":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    default:
      return "";
  }
};

const reconciliationStatusVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "default" as const;
    case "IN_PROGRESS":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
};

export function ReconciliationDetailDialog({
  open,
  onOpenChange,
  reconciliation: initialReconciliation,
  locale = "es",
}: ReconciliationDetailDialogProps) {
  const t = useTranslations("Reconciliation");
  const dateLocale = locale === "es" ? es : enUS;

  const { data: liveReconciliation } = useReconciliation(
    initialReconciliation?.id || "",
  );
  const reconciliation = liveReconciliation || initialReconciliation;

  const completeMutation = useCompleteReconciliation();
  const updateItemMutation = useUpdateReconciliationItem();

  const summary = useMemo(() => {
    if (!reconciliation?.items) {
      return { matched: 0, unmatched: 0, ignored: 0, created: 0 };
    }
    return reconciliation.items.reduce(
      (acc, item) => {
        const status = item.status.toUpperCase();
        if (status === "MATCHED") acc.matched++;
        else if (status === "UNMATCHED") acc.unmatched++;
        else if (status === "IGNORED") acc.ignored++;
        else if (status === "CREATED") acc.created++;
        return acc;
      },
      { matched: 0, unmatched: 0, ignored: 0, created: 0 },
    );
  }, [reconciliation?.items]);

  if (!reconciliation) return null;

  const isCompleted = reconciliation.status === "COMPLETED";
  const diff = Number(reconciliation.difference);

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(reconciliation.id);
      toast.success(t("completeSuccess"));
    } catch (error) {
      toast.error(t("completeError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleItemStatusChange = async (
    item: ReconciliationItemWithRelations,
    newStatus: string,
  ) => {
    try {
      await updateItemMutation.mutateAsync({
        id: item.id,
        status: newStatus as "MATCHED" | "UNMATCHED" | "CREATED" | "IGNORED",
      });
    } catch (error) {
      toast.error(t("updateItemError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("reconciliationDetail")}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("account")}</p>
            <p className="font-medium">{reconciliation.account?.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("period")}</p>
            <p className="text-sm">
              {format(new Date(reconciliation.periodStart), "dd/MM/yyyy", {
                locale: dateLocale,
              })}{" "}
              –{" "}
              {format(new Date(reconciliation.periodEnd), "dd/MM/yyyy", {
                locale: dateLocale,
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("status")}</p>
            <Badge
              variant={reconciliationStatusVariant(reconciliation.status)}
              className={reconciliationStatusClassName(reconciliation.status)}
            >
              {t(`status_${reconciliation.status}`)}
            </Badge>
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/50 rounded-lg p-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{t("openingBalance")}</p>
            <p className="text-lg font-bold">
              {formatCurrency(reconciliation.openingBalance)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{t("closingBalance")}</p>
            <p className="text-lg font-bold">
              {formatCurrency(reconciliation.closingBalance)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {t("statementBalance")}
            </p>
            <p className="text-lg font-bold">
              {formatCurrency(reconciliation.statementBalance)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{t("difference")}</p>
            <p
              className={cn(
                "text-lg font-bold",
                diff === 0 ? "text-green-600" : "text-red-600",
              )}
            >
              {formatCurrency(diff)}
            </p>
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            {t("matched")}: {summary.matched}
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            {t("unmatched")}: {summary.unmatched}
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
            {t("created")}: {summary.created}
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
            {t("ignored")}: {summary.ignored}
          </div>
        </div>

        {/* Items table */}
        {reconciliation.items && reconciliation.items.length > 0 && (
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("itemStatus")}</TableHead>
                  <TableHead>{t("itemDate")}</TableHead>
                  <TableHead>{t("itemDescription")}</TableHead>
                  <TableHead className="text-right">{t("itemAmount")}</TableHead>
                  <TableHead>{t("itemReference")}</TableHead>
                  {!isCompleted && (
                    <TableHead>{t("itemAction")}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciliation.items.map((item) => (
                  <ReconciliationItemRow
                    key={item.id}
                    item={item}
                    isCompleted={isCompleted}
                    onStatusChange={handleItemStatusChange}
                    isUpdating={updateItemMutation.isPending}
                    t={t}
                    dateLocale={dateLocale}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {reconciliation.items?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{t("noItems")}</p>
          </div>
        )}

        {/* Notes */}
        {reconciliation.notes && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("notes")}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {reconciliation.notes}
              </p>
            </div>
          </>
        )}

        {/* Completed info */}
        {isCompleted && reconciliation.reconciledBy && (
          <>
            <Separator />
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {t("reconciledBy")}: {reconciliation.reconciledBy.name}
                  </span>
                </div>
                {reconciliation.reconciledAt && (
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      {format(
                        new Date(reconciliation.reconciledAt),
                        "dd/MM/yyyy hh:mm a",
                        { locale: dateLocale },
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Complete button */}
        {!isCompleted && (
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleComplete}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {t("completeReconciliation")}
            </Button>
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
}

interface ReconciliationItemRowProps {
  item: ReconciliationItemWithRelations;
  isCompleted: boolean;
  onStatusChange: (
    item: ReconciliationItemWithRelations,
    newStatus: string,
  ) => void;
  isUpdating: boolean;
  t: (key: string) => string;
  dateLocale: typeof es | typeof enUS;
}

function ReconciliationItemRow({
  item,
  isCompleted,
  onStatusChange,
  isUpdating,
  t,
  dateLocale,
}: ReconciliationItemRowProps) {
  const hasTransaction = !!item.transaction;
  const hasExternal =
    item.externalRef || item.externalAmount || item.externalDate;

  const displayDate = hasTransaction
    ? item.transaction!.transactionDate
    : item.externalDate;
  const displayDescription = hasTransaction
    ? item.transaction!.description
    : item.externalRef;
  const displayAmount = hasTransaction
    ? item.transaction!.amount
    : item.externalAmount;
  const displayRef = hasTransaction
    ? item.transaction!.reference
    : item.externalRef;

  return (
    <TableRow>
      <TableCell>
        <Badge
          variant={itemStatusVariant(item.status)}
          className={itemStatusClassName(item.status)}
        >
          {t(`itemStatus_${item.status}`)}
        </Badge>
        {hasTransaction && (
          <span className="block text-xs text-muted-foreground mt-0.5">
            {t("systemTransaction")}
          </span>
        )}
        {!hasTransaction && hasExternal && (
          <span className="block text-xs text-muted-foreground mt-0.5">
            {t("statementImport")}
          </span>
        )}
      </TableCell>
      <TableCell className="text-sm">
        {displayDate
          ? format(new Date(displayDate), "dd/MM/yyyy", { locale: dateLocale })
          : "–"}
      </TableCell>
      <TableCell className="text-sm max-w-[200px] truncate">
        {displayDescription || "–"}
      </TableCell>
      <TableCell className="text-right text-sm font-medium">
        {displayAmount ? formatCurrency(displayAmount) : "–"}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {displayRef || "–"}
      </TableCell>
      {!isCompleted && (
        <TableCell>
          <Select
            value={item.status}
            onValueChange={(value) => onStatusChange(item, value)}
            disabled={isUpdating}
          >
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MATCHED">{t("itemStatus_MATCHED")}</SelectItem>
              <SelectItem value="UNMATCHED">
                {t("itemStatus_UNMATCHED")}
              </SelectItem>
              <SelectItem value="CREATED">{t("itemStatus_CREATED")}</SelectItem>
              <SelectItem value="IGNORED">{t("itemStatus_IGNORED")}</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
      )}
    </TableRow>
  );
}
