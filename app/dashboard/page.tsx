"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { TopProductsCard } from "@/components/dashboard/top-products-card";
import { LowStockCard } from "@/components/dashboard/low-stock-card";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useTranslations } from "next-intl";
import { DollarSign, ShoppingCart, TrendingDown, Users } from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { data: stats, isLoading } = useDashboardStats();

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("totalSales")}
          value={stats ? formatCurrency(stats.totalSales) : "$0"}
          change={stats?.salesGrowth}
          icon={DollarSign}
          description={t("vsLastMonth")}
          loading={isLoading}
        />
        <StatCard
          title={t("salesCount")}
          value={stats?.salesCount.toString() || "0"}
          icon={ShoppingCart}
          description={t("thisMonth")}
          loading={isLoading}
        />
        <StatCard
          title={t("totalExpenses")}
          value={stats ? formatCurrency(stats.totalExpenses) : "$0"}
          change={stats?.expensesGrowth}
          icon={TrendingDown}
          description={t("vsLastMonth")}
          loading={isLoading}
        />
        <StatCard
          title={t("totalCustomers")}
          value={stats?.customerCount.toString() || "0"}
          icon={Users}
          description={t("allTime")}
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="lg:col-span-1">
          <TopProductsCard />
        </div>
      </div>

      {/* Low Stock Alerts */}
      <LowStockCard />
    </div>
  );
}
