import { NextRequest, NextResponse } from "next/server";
import { readApiError } from "@/lib/api/error";
import { accessCookieOptions, refreshCookieOptions } from "@/lib/auth/cookies";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/session";
import type { AuthResponse } from "@/lib/auth/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) return NextResponse.json({ message: "No refresh token" }, { status: 401 });

  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "user-agent": request.headers.get("user-agent") ?? ""
    },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    return NextResponse.json({ message: await readApiError(response) }, { status: response.status });
  }

  const result = (await response.json()) as AuthResponse;
  const next = NextResponse.json({ user: result.user });
  next.cookies.set(ACCESS_TOKEN_COOKIE, result.accessToken, accessCookieOptions);
  next.cookies.set(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshCookieOptions);
  return next;
}
