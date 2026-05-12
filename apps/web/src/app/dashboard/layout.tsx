import { AppShell } from "@/components/layout/app-shell";

export default function DashboardSegmentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
