import { NextRequest, NextResponse } from "next/server";
import { accessCookieOptions, refreshCookieOptions } from "@/lib/auth/cookies";
import { decodeJwtPayload, isJwtExpired } from "@/lib/auth/jwt";
import { getRoleDashboard, isAuthRoute, isProtectedRoute, requiredPermissionForPath, requiredRolesForPath } from "@/lib/auth/route-registry";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/session";
import type { AuthResponse, RoleKey } from "@/lib/auth/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type TokenPayload = {
  role?: RoleKey;
  permissions?: string[];
  exp?: number;
  onboardingCompletedAt?: string | null;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (isAuthRoute(pathname)) {
    if (accessToken && !isJwtExpired(accessToken)) {
      const payload = decodeJwtPayload<TokenPayload>(accessToken);
      return NextResponse.redirect(new URL(getRoleDashboard(payload?.role), request.url));
    }
    return NextResponse.next();
  }

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  let token = accessToken;
  const response = NextResponse.next();

  if ((!token || isJwtExpired(token)) && refreshToken) {
    const refreshed = await refreshSession(refreshToken, request);
    if (refreshed) {
      token = refreshed.accessToken;
      response.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, accessCookieOptions);
      response.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken, refreshCookieOptions);
    }
  }

  if (!token || isJwtExpired(token)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwtPayload<TokenPayload>(token);
  let currentPayload = payload;

  if (!currentPayload?.onboardingCompletedAt && refreshToken) {
    const refreshed = await refreshSession(refreshToken, request);
    if (refreshed) {
      token = refreshed.accessToken;
      currentPayload = decodeJwtPayload<TokenPayload>(token);
      response.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, accessCookieOptions);
      response.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken, refreshCookieOptions);
    }
  }

  const role = currentPayload?.role;
  const permissions = currentPayload?.permissions ?? [];
  const requiredRoles = requiredRolesForPath(pathname);
  const requiredPermission = requiredPermissionForPath(pathname);
  let onboardingCompleted = Boolean(currentPayload?.onboardingCompletedAt);

  if (!onboardingCompleted) {
    const status = await fetchCurrentUserStatus(token);
    onboardingCompleted = Boolean(status?.onboardingCompletedAt);
  }

  if (pathname !== "/onboarding" && !onboardingCompleted) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (pathname === "/onboarding" && onboardingCompleted) {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  if (pathname === "/dashboard" && role) {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  if (requiredRoles && (!role || !requiredRoles.includes(role))) {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  return response;
}

async function fetchCurrentUserStatus(accessToken: string) {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) return null;
    return (await response.json()) as { onboardingCompletedAt: string | null };
  } catch {
    return null;
  }
}

async function refreshSession(refreshToken: string, request: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-agent": request.headers.get("user-agent") ?? ""
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) return null;
    return (await response.json()) as AuthResponse;
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/account/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/activate-account"
  ]
};
