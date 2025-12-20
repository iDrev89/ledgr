"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { X, CalendarIcon, Filter, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const dateLocale = locale === "es" ? es : enUS;
  const hasDate = dateFrom;
  const hasActiveFilters = sellerId || hasDate;

  // Auto-expand when filters are applied
  useEffect(() => {
    if (hasActiveFilters && !isOpen) {
      setIsOpen(true);
    }
  }, [hasActiveFilters, isOpen]);

  const handleSellerChange = (newSellerId: string) => {
    onFiltersChange({
      sellerId: newSellerId || undefined,
      dateFrom,
      dateTo,
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Set both dateFrom and dateTo to the same date to filter for that specific day
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4">
        {/* Left side: Trigger */}
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">{t("filters")}</h3>
              {hasActiveFilters && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {(sellerId ? 1 : 0) + (hasDate ? 1 : 0)}
                </span>
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        {/* Right side: Clear all button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="h-8 text-xs"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {t("clearAllFilters")}
          </Button>
        )}
      </div>

      {/* Filter Fields - Collapsible Content */}
      <CollapsibleContent>
        <div className="border-t px-4 pb-4 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Seller Filter */}
        <div className="space-y-2">
          <Label htmlFor="seller-filter" className="text-xs font-medium text-muted-foreground">
            {t("filterBySeller")}
          </Label>
          <UserSelector
            value={sellerId}
            onValueChange={handleSellerChange}
            placeholder={t("allSellers")}
          />
        </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                {t("filterByDate")}
              </Label>
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
                        {format(parseISO(dateFrom), "dd/MM/yyyy", { locale: dateLocale })}
                      </span>
                    ) : (
                      <span>{t("selectDate")}</span>
                    )}
                    <div className="flex items-center gap-1">
                      {hasDate && (
                        <span
                          onClick={handleClearDate}
                          className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer inline-flex"
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
                          <span className="sr-only">{t("clearFilters")}</span>
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
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
