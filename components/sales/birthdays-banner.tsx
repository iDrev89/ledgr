"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Cake, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTodaysBirthdays } from "@/hooks/use-dashboard";

export function BirthdaysBanner() {
  const t = useTranslations("Dashboard");
  const { data: birthdays, isLoading } = useTodaysBirthdays();
  const [expanded, setExpanded] = useState(false);

  if (isLoading || !birthdays || birthdays.length === 0) {
    return null;
  }

  const summary =
    birthdays.length === 1
      ? t("birthdayToday")
      : t("birthdaysToday", { count: birthdays.length });

  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className="w-full text-left flex flex-wrap items-center gap-2 rounded-lg border bg-muted/60 px-3 py-2 transition-colors hover:bg-muted/80"
    >
      <div className="flex items-center gap-1.5 shrink-0">
        <Cake className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {expanded ? t("todaysBirthdays") : summary}
        </span>
      </div>

      {expanded && (
        <>
          <div className="h-3 w-px bg-border shrink-0" />
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {birthdays.map((customer) => (
              <span
                key={customer.id}
                className="inline-flex items-center rounded-sm border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground"
              >
                {customer.name}
              </span>
            ))}
          </div>
        </>
      )}

      <ChevronDown
        className={cn(
          "size-3.5 text-muted-foreground shrink-0 ml-auto transition-transform duration-200",
          expanded && "rotate-180",
        )}
      />
    </button>
  );
}
