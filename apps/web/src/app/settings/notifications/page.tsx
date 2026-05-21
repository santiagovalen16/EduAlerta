import { AppShell } from "@/components/layout/app-shell";
import { NotificationsCenter } from "@/components/settings/notifications-center";
import { SettingsNav } from "@/components/settings/settings-nav";
import { serverApiFetch } from "@/lib/api/server-client";
import type { UserProfile } from "@/services/users/users.service";

export default async function SettingsNotificationsPage() {
  const profile = await serverApiFetch<UserProfile>("/api/users/me");

  return (
    <AppShell>
      <div className="flex flex-col gap-6 md:flex-row">
        <SettingsNav />
        <div className="flex-1">
          <NotificationsCenter preferences={profile.preferences} />
        </div>
      </div>
    </AppShell>
  );
}
