import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditAction, Prisma } from "@prisma/client";
import { assertInstitutionAccess, getInstitutionScope } from "../../common/authz/tenant-scope";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";
import { BulkAttendanceDto } from "./dto/bulk-attendance.dto";
import { QueryAttendanceDto } from "./dto/query-attendance.dto";
import { UpsertAttendanceDto } from "./dto/upsert-attendance.dto";

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: QueryAttendanceDto, user: CurrentUserPayload) {
    const institutionId = getInstitutionScope(user);
    const where: Prisma.AttendanceWhereInput = {
      deletedAt: null,
      studentId: query.studentId,
      courseId: query.courseId,
      status: query.status,
      student: { institutionId },
      date: query.from || query.to ? { gte: query.from ? new Date(query.from) : undefined, lte: query.to ? new Date(query.to) : undefined } : undefined
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.findMany({
        where,
        include: { student: { select: { id: true, firstName: true, lastName: true } }, course: { select: { id: true, name: true } } },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      })
    ]);
    return { data, meta: { total, page: query.page, pageSize: query.pageSize, pageCount: Math.ceil(total / query.pageSize) } };
  }

  async upsert(dto: UpsertAttendanceDto, user: CurrentUserPayload) {
    const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, deletedAt: null } });
    if (!student) throw new NotFoundException("Student not found.");
    assertInstitutionAccess(user, student.institutionId);

    const record = await this.prisma.attendance.upsert({
      where: { studentId_courseId_date: { studentId: dto.studentId, courseId: dto.courseId, date: new Date(dto.date) } },
      update: { status: dto.status, notes: dto.notes, deletedAt: null },
      create: { studentId: dto.studentId, courseId: dto.courseId, date: new Date(dto.date), status: dto.status, notes: dto.notes }
    });
    await this.prisma.auditLog.create({
      data: { actorId: user.sub, action: AuditAction.ATTENDANCE_RECORDED, entityType: "Attendance", entityId: record.id, after: record }
    });
    return record;
  }

  async bulk(dto: BulkAttendanceDto, user: CurrentUserPayload) {
    const data = [];
    for (const record of dto.records) {
      data.push(await this.upsert(record, user));
    }
    return { data };
  }
}
