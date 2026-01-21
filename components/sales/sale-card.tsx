"use client";

import {
  Eye,
  Trash2,
  Package,
  Calendar,
  MoreVertical,
  CreditCard,
  Edit,
  Check,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { SaleWithDetails } from "@/lib/types/sales";
import { PaymentMethod } from "@/prisma/prisma-client";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SaleCardProps {
  sale: SaleWithDetails;
  onView: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onCloseSale?: () => void;
  isDraftCard?: boolean;
  isAdmin?: boolean;
  locale?: string;
}

const formatCurrency = (value: string | number) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

const getPaymentMethodBadge = (
  method: PaymentMethod,
  t: (key: string) => string,
) => {
  const variants: Record<
    PaymentMethod,
    { label: string; variant: "default" | "secondary" | "outline" }
  > = {
    [PaymentMethod.CASH]: {
      label: t("paymentCash"),
      variant: "default",
    },
    [PaymentMethod.CARD]: {
      label: t("paymentCard"),
      variant: "secondary",
    },
    [PaymentMethod.TRANSFER]: {
      label: t("paymentTransfer"),
      variant: "outline",
    },
    [PaymentMethod.DIGITAL]: {
      label: t("paymentDigital"),
      variant: "secondary",
    },
    [PaymentMethod.OTHER]: {
      label: t("paymentOther"),
      variant: "outline",
    },
  };

  const config = variants[method];
  return (
    <Badge
      variant={config.variant}
      className="font-normal text-xs px-2 py-0.5 pointer-events-none"
    >
      {config.label}
    </Badge>
  );
};

export function SaleCard({
  sale,
  onView,
  onDelete,
  onEdit,
  onCloseSale,
  isDraftCard = false,
  isAdmin = false,
  locale = "es",
}: SaleCardProps) {
  const t = useTranslations("Sales");
  const dateLocale = locale === "es" ? es : enUS;
  const hasReceivable =
    sale.receivable && parseFloat(sale.receivable.balance) > 0;

  // Primary payment method
  const primaryPayment =
    sale.payments && sale.payments.length > 0 ? sale.payments[0] : null;
  const hasMultiplePayments = sale.payments && sale.payments.length > 1;

  // Product summary
  const productNames = sale.items.map((i) => i.product.name).join(", ");
  const itemCount = sale.items.length;

  return (
    <Card
      className="group overflow-hidden ring-1 ring-border shadow-md transition-all duration-200 hover:shadow-lg hover:ring-primary/50 bg-background rounded-xl cursor-pointer"
      onClick={onView}
    >
      <CardContent className="p-0 relative">
        {/* Header: Sale Info + Price */}
        <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-b border-border/40">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Badge
              variant="secondary"
              className="text-[11px] h-5 px-2 font-mono font-medium bg-background text-foreground border border-border/60 tabular-nums"
            >
              #{String(sale.saleNumber).padStart(4, "0")}
            </Badge>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {format(new Date(sale.createdAt), "dd/MM/yy - hh:mm a", {
                locale: dateLocale,
              })}
            </span>
          </div>

          {/* Price in Header */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tabular-nums">
              {formatCurrency(sale.total)}
            </span>
            {/* Action Menu */}
            {isAdmin && !isDraftCard && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {t("edit")}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("delete")}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 grid gap-4">
          {/* Customer Section with Left Accent */}
          <div className="flex items-start gap-3 pl-3 border-l-2 border-primary/40">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {sale.customer.name}
              </p>
              {hasReceivable && sale.receivable && (
                <span className="inline-flex items-center text-[10px] font-medium text-amber-600 dark:text-amber-500 mt-1">
                  {t("balance")}: {formatCurrency(sale.receivable.balance)}
                </span>
              )}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Bottom Row: Details & Quick Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {/* Items summary */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4 shrink-0" />
                <span className="truncate text-xs">
                  <span className="font-medium text-foreground">
                    {itemCount}
                  </span>{" "}
                  {itemCount === 1 ? t("item") : t("items")} • {productNames}
                </span>
              </div>

              {/* Payment info */}
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground" />
                {sale.payments && sale.payments.length > 0 ? (
                  <>
                    {primaryPayment &&
                      !hasMultiplePayments &&
                      getPaymentMethodBadge(primaryPayment.method, t)}
                    {hasMultiplePayments && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-5 px-1.5"
                      >
                        {sale.payments.length} {t("payments")}
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {t("noPayments")}
                  </span>
                )}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="shrink-0 flex gap-2">
              {isDraftCard ? (
                <>
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onCloseSale && (
                    <Button
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseSale();
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 text-xs font-medium border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                >
                  <Eye className="h-4 w-4 md:mr-1.5" />
                  <span className="hidden md:inline">{t("viewDetails")}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Sold By Footer (if visible) */}
          {sale.soldBy && sale.soldBy.id !== sale.createdBy.id && (
            <div className="text-[10px] text-muted-foreground text-right mt-1">
              {t("soldBy")}{" "}
              <span className="font-medium text-foreground">
                {sale.soldBy.name}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
