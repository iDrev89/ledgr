"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

interface PermissionGateProps {
  children: ReactNode;
  statement: string;
  action: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Client component that conditionally renders children based on permissions
 *
 * IMPORTANT: This is for UI purposes only. Real security must be enforced
 * by middleware, server components, or API endpoints.
 *
 * @example
 * <PermissionGate statement="users" action="create">
 *   <CreateUserButton />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  statement,
  action,
  fallback,
  loadingFallback,
}: PermissionGateProps) {
  const { hasPermission, isPending } = usePermissions();
  const t = useTranslations("Unauthorized");

  // Show loading state while checking session
  if (isPending) {
    if (loadingFallback) {
      return <>{loadingFallback}</>;
    }
    // Default loading skeleton
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  // After loading, check permission
  if (!hasPermission(statement, action)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // Default: show nothing (can be changed to show an alert)
    return null;
  }

  return <>{children}</>;
}
