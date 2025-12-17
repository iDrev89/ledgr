"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageHeader from "@/components/shared/PageHeader";
import { ShoppingCart, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const t = useTranslations("Reports");

  const reports = [
    {
      title: t("businessSummaryTitle"),
      description: t("description"),
      icon: TrendingUp,
      href: "/reports/business-summary",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: t("purchasesTitle"),
      description: t("description"),
      icon: ShoppingCart,
      href: "/reports/purchases",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader pageTitle={t("title")} pageDes={t("reportsOverview")} />

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Link key={report.href} href={report.href}>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${report.bgColor}`}>
                      <Icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <span>
                      {t("drillDown")}
                      <ArrowRight className="ml-auto h-4 w-4" />
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
