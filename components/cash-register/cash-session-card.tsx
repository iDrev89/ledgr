"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
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

interface CashSessionCardProps {
  session: CashSessionWithRelations;
  onView: () => void;
  onDelete: () => void;
}

export const CashSessionCard = ({
  session,
  onView,
  onDelete,
}: CashSessionCardProps) => {
  const t = useTranslations("CashRegister");
  const isOpen = session.status === "OPEN";
  const diff = session.difference ? parseFloat(session.difference) : null;

  return (
    <Card className="cursor-pointer hover:bg-accent/50 transition-all" onClick={onView}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{session.account.name}</span>
            <Badge variant={isOpen ? "default" : "secondary"}>
              {isOpen ? t("statusOpen") : t("statusClosed")}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              aria-label={t("sessionDetail")}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {isOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label={t("delete")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">{t("openedAt")}</span>
            <p className="font-medium">
              {new Date(session.openedAt).toLocaleDateString("es-CO")}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("openingBalance")}</span>
            <p className="font-mono font-medium tabular-nums">
              {formatCurrency(session.openingBalance)}
            </p>
          </div>
          {!isOpen && (
            <>
              <div>
                <span className="text-muted-foreground">{t("actualBalance")}</span>
                <p className="font-mono font-medium tabular-nums">
                  {formatCurrency(session.actualBalance)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("difference")}</span>
                <p
                  className={cn(
                    "font-mono font-medium tabular-nums",
                    diff === null || diff === 0
                      ? "text-success"
                      : diff < 0
                        ? "text-destructive"
                        : "text-warning",
                  )}
                >
                  {formatCurrency(session.difference)}
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {t("openedBy")}: {session.openedBy.name}
          {session.closedBy && ` | ${t("closedBy")}: ${session.closedBy.name}`}
        </p>
      </CardContent>
    </Card>
  );
};
