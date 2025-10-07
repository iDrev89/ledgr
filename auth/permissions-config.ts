/**
 * Centralized permission configuration
 * Maps routes to their required permissions (statement + action)
 */

export interface RoutePermission {
  statement: string;
  action: string;
}

/**
 * Route permissions mapping
 * Define which permissions are needed to access each route
 */
export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  "/users": { statement: "users", action: "read" },
  "/sales": { statement: "sales", action: "read" },
  "/products": { statement: "products", action: "read" },
  "/expenses": { statement: "expenses", action: "read" },
  "/reports": { statement: "reports", action: "read" },
  "/inventory": { statement: "inventory", action: "read" },
  "/payroll": { statement: "payroll", action: "read" },
} as const;

/**
 * Get required permission for a given pathname
 * @param pathname - The route pathname
 * @returns RoutePermission or null if route is not protected
 */
export function getRoutePermission(pathname: string): RoutePermission | null {
  // Check exact matches and prefixes
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return permission;
    }
  }
  return null;
}

/**
 * Check if a route requires authentication
 * @param pathname - The route pathname
 * @returns boolean
 */
export function isProtectedRoute(pathname: string): boolean {
  return getRoutePermission(pathname) !== null;
}
