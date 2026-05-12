import { AppShell } from "@/components/layout/app-shell";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { serverApiFetch } from "@/lib/api/server-client";
import type { AuthUser } from "@/lib/auth/types";

export default async function OnboardingPage() {
  const user = await serverApiFetch<AuthUser>("/api/auth/me");

  return (
    <AppShell>
      <OnboardingFlow user={user} />
    </AppShell>
  );
}
