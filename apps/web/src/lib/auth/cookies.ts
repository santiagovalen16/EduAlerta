import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/"
} satisfies Partial<ResponseCookie>;

export const accessCookieOptions = {
  ...authCookieOptions,
  maxAge: 60 * 15
} satisfies Partial<ResponseCookie>;

export const refreshCookieOptions = {
  ...authCookieOptions,
  maxAge: 60 * 60 * 24 * 7
} satisfies Partial<ResponseCookie>;
