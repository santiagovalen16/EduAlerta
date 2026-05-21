import { redirect } from "next/navigation";

export default function DashboardMonitoringPage() {
  redirect("/dashboard/alerts");
}
