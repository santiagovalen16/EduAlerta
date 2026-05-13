import { Injectable, NotFoundException } from "@nestjs/common";
import { assertInstitutionAccess } from "../../common/authz/tenant-scope";
import { assertStudentVisibility, getStudentVisibilityWhere } from "../../common/authz/student-scope";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { QueryStudentsDto } from "./dto/query-students.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentsRepository } from "./students.repository";

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentsRepository: StudentsRepository
  ) {}

  async findMany(query: QueryStudentsDto, user: CurrentUserPayload) {
    const [total, data] = await this.studentsRepository.findMany({
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      riskLevel: query.riskLevel,
      visibility: getStudentVisibilityWhere(user)
    });

    return { data, meta: { total, page: query.page, pageSize: query.pageSize } };
  }

  findAtRisk(user: CurrentUserPayload) {
    return this.studentsRepository.findAtRisk(5, getStudentVisibilityWhere(user));
  }

  async findById(id: string, user: CurrentUserPayload) {
    const student = await this.studentsRepository.findById(id, getStudentVisibilityWhere(user));
    if (!student) throw new NotFoundException("Student not found");
    assertStudentVisibility(user, student);
    return student;
  }

  async create(dto: CreateStudentDto, user: CurrentUserPayload) {
    assertInstitutionAccess(user, dto.institutionId);
    const student = await this.prisma.$transaction(async (tx) => {
      const created = await tx.student.create({ data: dto });
      await tx.auditLog.create({
        data: {
          actorId: user.sub,
          action: "STUDENT_CREATED",
          entityType: "Student",
          entityId: created.id,
          metadata: { documentNumber: dto.documentNumber, riskLevel: dto.riskLevel }
        }
      });
      return created;
    });

    return student;
  }

  async update(id: string, dto: UpdateStudentDto, user: CurrentUserPayload) {
    await this.findById(id, user);
    const student = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.student.update({ where: { id }, data: dto });
      await tx.auditLog.create({
        data: {
          actorId: user.sub,
          action: "STUDENT_UPDATED",
          entityType: "Student",
          entityId: id,
          metadata: { ...dto }
        }
      });
      return updated;
    });

    return student;
  }

  async remove(id: string, user: CurrentUserPayload) {
    await this.findById(id, user);
    const student = await this.studentsRepository.softDelete(id);
    await this.prisma.auditLog.create({
      data: {
        actorId: user.sub,
        action: "STUDENT_DELETED",
        entityType: "Student",
        entityId: id
      }
    });
    return student;
  }
}
