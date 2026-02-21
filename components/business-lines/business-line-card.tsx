"use client";

import { Pencil, Trash2, Tag, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BusinessLineWithRelations } from "@/lib/types/business-line";
import { useTranslations } from "next-intl";

interface BusinessLineCardProps {
  businessLine: BusinessLineWithRelations;
  onEdit: () => void;
  onDelete: () => void;
}

export function BusinessLineCard({
  businessLine,
  onEdit,
  onDelete,
}: BusinessLineCardProps) {
  const t = useTranslations("BusinessLines");

  return (
    <Card className="rounded-lg border border-border hover:bg-secondary/50 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {businessLine.color && (
                <div
                  className="h-4 w-4 rounded-full border border-border shrink-0"
                  style={{ backgroundColor: businessLine.color }}
                />
              )}
              <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
              <h3 className="font-semibold text-sm truncate">
                {businessLine.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge
                variant={businessLine.active ? "default" : "secondary"}
                className="text-xs"
              >
                {businessLine.active ? t("active") : t("inactive")}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              aria-label={t("edit")}
              tabIndex={0}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label={t("delete")}
              tabIndex={0}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {businessLine.code && (
          <div className="flex items-center gap-2">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              {businessLine.code}
            </span>
          </div>
        )}

        {businessLine._count && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 rounded bg-muted/50">
              <p className="font-medium">{businessLine._count.products}</p>
              <p className="text-muted-foreground">{t("products")}</p>
            </div>
            <div className="text-center p-2 rounded bg-muted/50">
              <p className="font-medium">{businessLine._count.sales}</p>
              <p className="text-muted-foreground">{t("sales")}</p>
            </div>
            <div className="text-center p-2 rounded bg-muted/50">
              <p className="font-medium">{businessLine._count.expenses}</p>
              <p className="text-muted-foreground">{t("expenses")}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
