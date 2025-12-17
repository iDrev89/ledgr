"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DateRange, DatePreset } from "@/lib/types/reports";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  locale?: string;
}

export function DateRangePicker({
  value,
  onChange,
  locale = "es",
}: DateRangePickerProps) {
  const t = useTranslations("Reports");
  const [preset, setPreset] = useState<DatePreset>("month");
  const dateLocale = locale === "es" ? es : enUS;

  // Calculate preset ranges
  const presets: Record<Exclude<DatePreset, "custom">, DateRange> = {
    today: { start: startOfDay(new Date()), end: endOfDay(new Date()) },
    week: { start: startOfWeek(new Date()), end: endOfWeek(new Date()) },
    month: { start: startOfMonth(new Date()), end: endOfMonth(new Date()) },
    year: { start: startOfYear(new Date()), end: endOfYear(new Date()) },
  };

  const handlePresetChange = (newPreset: DatePreset) => {
    setPreset(newPreset);
    if (newPreset !== "custom") {
      onChange(presets[newPreset]);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-2">
      {/* Preset Tabs */}
      <Tabs value={preset} onValueChange={(v) => handlePresetChange(v as DatePreset)}>
        <TabsList className="grid w-full grid-cols-5 md:w-auto">
          <TabsTrigger value="today">{t("today")}</TabsTrigger>
          <TabsTrigger value="week">{t("week")}</TabsTrigger>
          <TabsTrigger value="month">{t("month")}</TabsTrigger>
          <TabsTrigger value="year">{t("year")}</TabsTrigger>
          <TabsTrigger value="custom">{t("custom")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Custom Date Range Picker */}
      {preset === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal md:w-auto"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value.start && value.end ? (
                <>
                  {format(value.start, "PPP", { locale: dateLocale })} -{" "}
                  {format(value.end, "PPP", { locale: dateLocale })}
                </>
              ) : (
                <span>{t("selectDateRange")}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={value.start}
              selected={{ from: value.start, to: value.end }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onChange({ start: range.from, end: range.to });
                }
              }}
              numberOfMonths={2}
              locale={dateLocale}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

