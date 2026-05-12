import { NextRequest, NextResponse } from "next/server";
import { accessCookieOptions, refreshCookieOptions } from "@/lib/auth/cookies";
import { getRoleDashboard } from "@/lib/auth/routing";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/session";
import type { AuthResponse } from "@/lib/auth/types";
import { readApiError } from "@/lib/api/error";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "user-agent": request.headers.get("user-agent") ?? ""
    },
    body: JSON.stringify(await request.json())
  });

  if (!response.ok) {
    return NextResponse.json({ message: await readApiError(response) }, { status: response.status });
  }

  const result = (await response.json()) as AuthResponse;
  const next = NextResponse.json({
    user: result.user,
    redirectTo: result.user.onboardingCompletedAt ? getRoleDashboard(result.user.role) : "/onboarding"
  });
  next.cookies.set(ACCESS_TOKEN_COOKIE, result.accessToken, accessCookieOptions);
  next.cookies.set(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshCookieOptions);
  return next;
}
