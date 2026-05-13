import { Injectable } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import { getStudentVisibilityWhere } from "../../common/authz/student-scope";
import { getInstitutionScope } from "../../common/authz/tenant-scope";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query = "", user: CurrentUserPayload) {
    const q = query.trim();
    if (q.length < 2) return { data: [] };
    const institutionId = user.role === RoleKey.ACUDIENTE ? undefined : getInstitutionScope(user);
    const visibility = getStudentVisibilityWhere(user);
    const [students, alerts, cases, institutions] = await Promise.all([
      this.prisma.student.findMany({
        where: { deletedAt: null, ...visibility, OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }, { documentNumber: { contains: q, mode: "insensitive" } }] },
        take: 8
      }),
      this.prisma.alert.findMany({
        where: { deletedAt: null, student: visibility, description: { contains: q, mode: "insensitive" } },
        take: 8
      }),
      this.prisma.monitoringCase.findMany({
        where: { deletedAt: null, institutionId, student: visibility, OR: [{ title: { contains: q, mode: "insensitive" } }, { summary: { contains: q, mode: "insensitive" } }] },
        take: 8
      }),
      this.prisma.institution.findMany({
        where: { deletedAt: null, id: user.role === RoleKey.ACUDIENTE ? "__guardian_child_scope__" : institutionId, name: { contains: q, mode: "insensitive" } },
        take: 8
      })
    ]);

    return {
      data: [
        ...students.map((item) => ({ type: "student", id: item.id, label: `${item.firstName} ${item.lastName}`, href: `/dashboard/monitoring?studentId=${item.id}` })),
        ...alerts.map((item) => ({ type: "alert", id: item.id, label: item.description, href: `/dashboard/alerts?alertId=${item.id}` })),
        ...cases.map((item) => ({ type: "case", id: item.id, label: item.title, href: `/dashboard/cases?caseId=${item.id}` })),
        ...institutions.map((item) => ({ type: "institution", id: item.id, label: item.name, href: "/dashboard/territorial" }))
      ]
    };
  }
}
