"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "./DashboardShell";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Pages that should not show the dashboard shell
  const authPages = ["/login", "/register"];
  const isAuthPage = authPages.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
