import { NextRequest, NextResponse } from "next/server";
import { accessCookieOptions, refreshCookieOptions } from "@/lib/auth/cookies";
import { decodeJwtPayload, isJwtExpired } from "@/lib/auth/jwt";
import { getRoleDashboard, requiredRolesForPath } from "@/lib/auth/routing";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/session";
import type { AuthResponse, RoleKey } from "@/lib/auth/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/activate-account"];

type TokenPayload = {
  role?: RoleKey;
  exp?: number;
  onboardingCompletedAt?: string | null;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (accessToken && !isJwtExpired(accessToken)) {
      const payload = decodeJwtPayload<TokenPayload>(accessToken);
      return NextResponse.redirect(new URL(getRoleDashboard(payload?.role), request.url));
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/profile") && !pathname.startsWith("/settings") && !pathname.startsWith("/account") && !pathname.startsWith("/onboarding")) {
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
  const role = payload?.role;
  const requiredRoles = requiredRolesForPath(pathname);

  if (pathname !== "/onboarding" && !payload?.onboardingCompletedAt) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (pathname === "/onboarding" && payload?.onboardingCompletedAt) {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  if (pathname === "/dashboard" && role) {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  if (requiredRoles && (!role || !requiredRoles.includes(role))) {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  return response;
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
