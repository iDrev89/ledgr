"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Database,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Users,
  X,
  Package,
  DollarSign,
  FileText,
  Warehouse,
  Banknote,
  UserCircle,
  Building2,
  Receipt,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { usePermissions } from "@/hooks/use-permissions";
import {
  ROUTE_PERMISSIONS,
  type RoutePermission,
} from "@/auth/permissions-config";

interface SidebarProps {
  open: boolean;
  toggleSidebar: () => void;
}

interface NavItem {
  titleKey: string;
  icon: React.ElementType;
  href: string;
  requiredPermission?: RoutePermission;
}

interface NavGroup {
  titleKey: string;
  items: NavItem[];
}

export function Sidebar({ open, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("Sidebar");
  const { hasPermission, isPending } = usePermissions();

  const navGroups: NavGroup[] = [
    {
      titleKey: "overview",
      items: [
        {
          titleKey: "dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
          requiredPermission: ROUTE_PERMISSIONS["/dashboard"],
        },
      ],
    },
    {
      titleKey: "sales",
      items: [
        {
          titleKey: "salesMenu",
          icon: ShoppingCart,
          href: "/sales",
          requiredPermission: ROUTE_PERMISSIONS["/sales"],
        },
        {
          titleKey: "customers",
          icon: UserCircle,
          href: "/customers",
          requiredPermission: ROUTE_PERMISSIONS["/customers"],
        },
        {
          titleKey: "receivables",
          icon: Receipt,
          href: "/receivables",
          requiredPermission: ROUTE_PERMISSIONS["/receivables"],
        },
      ],
    },
    {
      titleKey: "inventory",
      items: [
        {
          titleKey: "products",
          icon: Package,
          href: "/products",
          requiredPermission: ROUTE_PERMISSIONS["/products"],
        },
        {
          titleKey: "suppliers",
          icon: Truck,
          href: "/suppliers",
          requiredPermission: ROUTE_PERMISSIONS["/suppliers"],
        },
        {
          titleKey: "purchases",
          icon: ShoppingBag,
          href: "/purchases",
          requiredPermission: ROUTE_PERMISSIONS["/purchases"],
        },
        {
          titleKey: "inventoryMenu",
          icon: Warehouse,
          href: "/inventory",
          requiredPermission: ROUTE_PERMISSIONS["/inventory"],
        },
      ],
    },
    {
      titleKey: "finance",
      items: [
        {
          titleKey: "expenses",
          icon: DollarSign,
          href: "/expenses",
          requiredPermission: ROUTE_PERMISSIONS["/expenses"],
        },
        {
          titleKey: "payroll",
          icon: Banknote,
          href: "/payroll",
          requiredPermission: ROUTE_PERMISSIONS["/payroll"],
        },
        {
          titleKey: "banks",
          icon: Building2,
          href: "/banks",
          requiredPermission: ROUTE_PERMISSIONS["/banks"],
        },
      ],
    },
    {
      titleKey: "reports",
      items: [
        {
          titleKey: "reportsMenu",
          icon: FileText,
          href: "/reports",
          requiredPermission: ROUTE_PERMISSIONS["/reports"],
        },
      ],
    },
    {
      titleKey: "administration",
      items: [
        {
          titleKey: "users",
          icon: Users,
          href: "/users",
          requiredPermission: ROUTE_PERMISSIONS["/users"],
        },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex justify-between items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold h-16">
          <Database className="h-6 w-6 text-primary" />
          <span className="text-xl">Ledgr</span>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <div className="overflow-auto py-2">
        {isPending ? (
          // Show skeleton while loading permissions
          <div className="space-y-6">
            {[1, 2, 3].map((groupIndex) => (
              <div key={groupIndex} className="px-3 py-2">
                <Skeleton className="h-3 w-20 mb-3 ml-4" />
                <div className="space-y-1">
                  {[1, 2, 3].map((itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center gap-3 px-4 py-2"
                    >
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show actual menu items after loading
          navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => {
              // If no permission required, always show
              if (!item.requiredPermission) return true;

              // Check if user has required permission

              const result = hasPermission(
                item.requiredPermission.statement,
                item.requiredPermission.action,
              );

              return result;
            });

            // Don't render empty groups
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.titleKey} className="px-3 py-2">
                <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t(`groups.${group.titleKey}`)}
                </h2>
                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <Link
                      key={item.titleKey}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground",
                      )}
                      onClick={toggleSidebar}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{t(`items.${item.titleKey}`)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
