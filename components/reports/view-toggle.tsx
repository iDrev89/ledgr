"use client";

import { LayoutGrid, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import type { ViewMode } from "@/lib/types/reports";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ view, onChange, className }: ViewToggleProps) {
  const t = useTranslations("Reports");

  return (
    <Tabs value={view} onValueChange={(v) => onChange(v as ViewMode)} className={className}>
      <TabsList>
        <TabsTrigger value="summary" className="gap-2">
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">{t("viewSummary")}</span>
        </TabsTrigger>
        <TabsTrigger value="detailed" className="gap-2">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">{t("viewDetailed")}</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

