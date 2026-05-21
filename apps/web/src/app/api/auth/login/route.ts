import { NextRequest, NextResponse } from "next/server";
import { accessCookieOptions, refreshCookieOptions } from "@/lib/auth/cookies";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/session";
import { getRoleDashboard } from "@/lib/auth/routing";
import type { AuthResponse } from "@/lib/auth/types";
import { readApiError } from "@/lib/api/error";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "user-agent": request.headers.get("user-agent") ?? ""
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    return NextResponse.json({ message: await readApiError(response) }, { status: response.status });
  }

  const text = await response.text();
  if (!text) {
    return NextResponse.json({ message: "La API de autenticacion respondio sin contenido." }, { status: 502 });
  }

  let result: AuthResponse;
  try {
    result = JSON.parse(text) as AuthResponse;
  } catch {
    return NextResponse.json({ message: "La API de autenticacion devolvio una respuesta invalida." }, { status: 502 });
  }

  const next = NextResponse.json({
    user: result.user,
    redirectTo: result.user.onboardingCompletedAt ? getRoleDashboard(result.user.role) : "/onboarding"
  });
  next.cookies.set(ACCESS_TOKEN_COOKIE, result.accessToken, accessCookieOptions);
  next.cookies.set(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshCookieOptions);
  return next;
}
