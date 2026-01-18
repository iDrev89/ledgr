"use client";

import { useTranslations } from "next-intl";
import { Cake, Gift, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTodaysBirthdays } from "@/hooks/use-dashboard";
import { cn } from "@/lib/utils";

interface BirthdaysCardProps {
  className?: string;
}

export function BirthdaysCard({ className }: BirthdaysCardProps) {
  const t = useTranslations("Dashboard");
  const { data: birthdays, isLoading } = useTodaysBirthdays();

  if (isLoading || !birthdays || birthdays.length === 0) {
    return null;
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden w-full md:max-w-sm border border-pink-200/60 dark:border-pink-900/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-gradient-to-b from-white to-pink-100/80 dark:from-zinc-900 dark:to-zinc-900/80",
        className,
      )}
    >
      {/* Subtle colorful gradient mesh for "alegria" without being "chillona" */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-gradient-to-br from-pink-500/5 to-purple-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-gradient-to-tr from-orange-400/5 to-yellow-400/5 blur-3xl pointer-events-none" />

      <CardHeader className="relative z-20 pb-1.5 p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white shadow-sm border border-pink-100/50 dark:bg-pink-900/20 dark:border-pink-800/30">
            <Cake className="size-4 text-pink-500 dark:text-pink-400" />
          </div>
          <div className="space-y-0 text-left">
            <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              {t("todaysBirthdays")}
              <Sparkles className="size-3 text-yellow-500/80 animate-pulse" />
            </CardTitle>
            <p className="text-[10px] text-muted-foreground font-medium">
              {birthdays.length === 1
                ? t("birthdayToday")
                : t("birthdaysToday", { count: birthdays.length })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-20 pt-0 px-3 pb-3">
        <div className="space-y-1.5">
          {birthdays.map((customer) => (
            <div
              key={customer.id}
              className="group flex items-center justify-between p-2 rounded-lg bg-white border border-pink-50/60 shadow-sm transition-all hover:bg-white hover:border-pink-200/50 hover:shadow-md hover:-translate-y-0.5 dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10"
            >
              <p className="font-medium text-xs text-foreground/90 group-hover:text-foreground pl-1">
                {customer.name}
              </p>
              <Badge
                variant="outline"
                className="bg-white/40 border-pink-200/50 text-pink-700 shadow-sm dark:bg-pink-950/20 dark:text-pink-300 dark:border-pink-900/30 text-[10px] h-5 px-1.5"
              >
                <Gift className="mr-1 size-2.5 text-pink-500" />
                {customer.age} {t("years")}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
