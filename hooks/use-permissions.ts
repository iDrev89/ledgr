"use client";

import { useSession, authClient } from "@/auth/auth-client";

/**
 * Client-side hook to check user permissions
 * Uses better-auth's checkRolePermission for permission checks (synchronous, no server call)
 *
 * IMPORTANT: This is for UI purposes only (showing/hiding elements)
 * Real security is enforced by middleware and server-side checks
 */
export function usePermissions() {
  const { data: session, isPending } = useSession();
  const userRoleString = session?.user?.role as "admin" | "user" | undefined;

  const isAdmin = () => userRoleString === "admin";
  const isUser = () => userRoleString === "user";

  /**
   * Check if the user's role has a specific permission
   * Uses better-auth's checkRolePermission (synchronous, client-side only)
   * Returns false while loading to avoid showing unauthorized content
   */
  const hasPermission = (statement: string, action: string): boolean => {
    // While loading session, return false (UI should handle loading state)
    if (isPending || !userRoleString) {
      return false;
    }

    try {
      // Use better-auth's checkRolePermission (synchronous, no server call)
      // This checks against the role definitions configured in auth-client
      const result = authClient.admin.checkRolePermission({
        role: userRoleString as any,
        permissions: {
          [statement]: [action],
        },
      });

      return result;
    } catch (error) {
      console.error("[usePermissions] Error checking permission:", error, {
        role: userRoleString,
        statement,
        action,
      });
      return false;
    }
  };

  return {
    userRole: userRoleString,
    isAdmin,
    isUser,
    hasPermission,
    isPending,
  };
}
