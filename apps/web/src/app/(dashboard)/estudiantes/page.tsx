import { LegacyStudentsPageView } from "@/modules/legacy/LegacyStudentsPageView";

export default function StudentsPage({ searchParams }: { searchParams: Promise<{ search?: string; riskLevel?: string; page?: string }> }) {
  return <LegacyStudentsPageView searchParams={searchParams} />;
}
