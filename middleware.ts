import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth/auth";
import { getRoutePermission } from "@/auth/permissions-config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires specific permissions
  const requiredPermission = getRoutePermission(pathname);

  // If route doesn't require specific permissions, just check session
  if (!requiredPermission) {
    return NextResponse.next();
  }

  try {
    // Check permission using better-auth's userHasPermission
    // This validates against the session stored in cookies
    const allowed = await auth.api.userHasPermission({
      body: {
        permissions: {
          [requiredPermission.statement]: [requiredPermission.action],
        },
      },
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });

    if (!allowed || !allowed.success) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  } catch (error) {
    console.error("[Middleware] Error checking permissions:", error);
    // If error (likely no session), redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
};
