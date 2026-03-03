"use client";

import {
  Pencil,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Hash,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BranchWithRelations } from "@/lib/types/branch";
import { useTranslations } from "next-intl";

interface BranchCardProps {
  branch: BranchWithRelations;
  onEdit: () => void;
  onDelete: () => void;
}

export function BranchCard({ branch, onEdit, onDelete }: BranchCardProps) {
  const t = useTranslations("Branches");

  return (
    <Card className="rounded-lg border border-border hover:bg-secondary/50 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <h3 className="font-semibold text-sm truncate">{branch.name}</h3>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {branch.code && (
                <Badge variant="outline" className="text-xs gap-1 font-mono">
                  <Hash className="h-3 w-3" />
                  {branch.code}
                </Badge>
              )}
              <Badge
                variant={branch.active ? "default" : "secondary"}
                className="text-xs"
              >
                {branch.active ? t("active") : t("inactive")}
              </Badge>
              {(branch as any).isDefault && (
                <Badge variant="outline" className="text-xs gap-1 text-amber-600 border-amber-300">
                  <Star className="h-3 w-3 fill-amber-500" />
                  {t("default")}
                </Badge>
              )}
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

        {branch.address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {branch.address}
            </span>
          </div>
        )}

        {branch.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">
              {branch.phone}
            </span>
          </div>
        )}

        {branch._count && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 rounded bg-muted/50">
              <p className="font-medium">{branch._count.users}</p>
              <p className="text-muted-foreground">{t("users")}</p>
            </div>
            <div className="text-center p-2 rounded bg-muted/50">
              <p className="font-medium">{branch._count.sales}</p>
              <p className="text-muted-foreground">{t("sales")}</p>
            </div>
            <div className="text-center p-2 rounded bg-muted/50">
              <p className="font-medium">{branch._count.financialAccounts}</p>
              <p className="text-muted-foreground">{t("accounts")}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
