import { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "edualerta.access_token";
export const REFRESH_TOKEN_COOKIE = "edualerta.refresh_token";

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
}
