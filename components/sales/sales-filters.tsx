"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { X, CalendarIcon, Filter, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserSelector } from "./user-selector";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";

interface SalesFiltersProps {
  sellerId?: string;
  dateFrom?: string;
  dateTo?: string;
  onFiltersChange: (filters: {
    sellerId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => void;
}

export const SalesFilters = ({
  sellerId,
  dateFrom,
  dateTo,
  onFiltersChange,
}: SalesFiltersProps) => {
  const t = useTranslations("Sales");
  const locale = useLocale();
  const { isAdmin } = usePermissions();
  const [activeFilter, setActiveFilter] = useState<"seller" | "date">("seller");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const dateLocale = locale === "es" ? es : enUS;
  const hasDate = dateFrom;
  const hasActiveFilters = sellerId || hasDate;

  const handleSellerChange = (newSellerId: string) => {
    onFiltersChange({
      sellerId: newSellerId || undefined,
      dateFrom,
      dateTo,
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const dateString = format(date, "yyyy-MM-dd");
      onFiltersChange({
        sellerId,
        dateFrom: dateString,
        dateTo: dateString,
      });
      setDatePickerOpen(false);
    }
  };

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFiltersChange({
      sellerId,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const handleClearAllFilters = () => {
    onFiltersChange({
      sellerId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  // If not admin, don't show filters
  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("filters")}</span>
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {(sellerId ? 1 : 0) + (hasDate ? 1 : 0)}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 pt-3 pb-3">
        <button
          onClick={() => setActiveFilter("seller")}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            activeFilter === "seller"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
          )}
        >
          {t("filterBySeller")}
        </button>
        <button
          onClick={() => setActiveFilter("date")}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            activeFilter === "date"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
          )}
        >
          {t("filterByDate")}
        </button>
      </div>

      {/* Filter Content */}
      <div className="pt-1">
        {activeFilter === "seller" && (
          <UserSelector
            value={sellerId}
            onValueChange={handleSellerChange}
            placeholder={t("allSellers")}
          />
        )}

        {activeFilter === "date" && (
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between font-normal",
                  !hasDate && "text-muted-foreground",
                )}
              >
                {hasDate ? (
                  <span className="truncate">
                    {format(parseISO(dateFrom), "dd/MM/yyyy", {
                      locale: dateLocale,
                    })}
                  </span>
                ) : (
                  <span>{t("selectDate")}</span>
                )}
                <div className="flex items-center gap-1">
                  {hasDate && (
                    <span
                      onClick={handleClearDate}
                      className="rounded-sm opacity-70 transition-opacity hover:opacity-100 cursor-pointer inline-flex"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleClearDate(e as any);
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </span>
                  )}
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom ? parseISO(dateFrom) : undefined}
                onSelect={handleDateChange}
                locale={dateLocale}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};
