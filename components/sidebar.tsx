"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface SidebarProps {
  open: boolean;
  toggleSidebar: () => void;
}

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar({ open, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
        },
        {
          title: "Sales",
          icon: ShoppingCart,
          href: "/sales",
        },
        {
          title: "Users",
          icon: Users,
          href: "/users",
        },
        {
          title: "Settings",
          icon: Settings,
          href: "/settings",
        },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex justify-between  items-center border-b px-4">
        <Link href="/" className="flex items-center  gap-2 font-semibold h-16">
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
        {navGroups.map((group) => (
          <div key={group.title} className="px-3 py-2">
            <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground"
                  )}
                   onClick={toggleSidebar}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

