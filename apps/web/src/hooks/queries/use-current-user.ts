"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/services/auth/auth.service";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser
  });
}
