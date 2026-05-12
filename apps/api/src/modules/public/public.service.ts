import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [students, activeAlerts, institutions, municipalities] = await this.prisma.$transaction([
      this.prisma.student.count({ where: { deletedAt: null } }),
      this.prisma.alert.count({ where: { deletedAt: null, status: { in: ["NEW", "IN_REVIEW", "ESCALATED"] } } }),
      this.prisma.institution.count({ where: { deletedAt: null } }),
      this.prisma.municipality.count({ where: { deletedAt: null } })
    ]);

    return {
      students,
      activeAlerts,
      institutions,
      municipalities
    };
  }
}
