import { accessCookieOptions, refreshCookieOptions } from "@/lib/auth/cookies";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/session";
import type { AuthResponse } from "@/lib/auth/types";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const cookieStore = await cookies();
  let token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const target = new URL(`${API_URL}/api/${path.join("/")}`);
  target.search = request.nextUrl.search;
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();

  let response = await fetch(target, {
    method: request.method,
    headers: {
      "Content-Type": request.headers.get("Content-Type") ?? "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body
  });

  let refreshed: AuthResponse | null = null;
  if (response.status === 401 && refreshToken) {
    refreshed = await refreshSession(refreshToken, request);
    if (refreshed) {
      token = refreshed.accessToken;
      response = await fetch(target, {
        method: request.method,
        headers: {
          "Content-Type": request.headers.get("Content-Type") ?? "application/json",
          Authorization: `Bearer ${token}`
        },
        body
      });
    }
  }

  const text = await response.text();
  const next = new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json"
    }
  });
  if (refreshed) {
    next.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, accessCookieOptions);
    next.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken, refreshCookieOptions);
  }
  return next;
}

async function refreshSession(refreshToken: string, request: Request) {
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

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
