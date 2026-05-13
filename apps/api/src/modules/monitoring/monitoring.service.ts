import { Injectable } from "@nestjs/common";
import { AttendanceStatus } from "@prisma/client";
import { getStudentVisibilityWhere } from "../../common/authz/student-scope";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { QueryMonitoringDto } from "./dto/query-monitoring.dto";
import { MonitoringRepository } from "./monitoring.repository";

@Injectable()
export class MonitoringService {
  constructor(private readonly monitoringRepository: MonitoringRepository) {}

  async overview(query: QueryMonitoringDto, user: CurrentUserPayload) {
    const visibility = getStudentVisibilityWhere(user);
    const [metrics, [total, students]] = await Promise.all([
      this.monitoringRepository.metrics(visibility),
      this.monitoringRepository.findStudents({
        page: query.page,
        pageSize: query.pageSize,
        search: query.search,
        riskLevel: query.riskLevel,
        sort: query.sort,
        visibility
      })
    ]);

    const data = students.map((student) => {
      const attendanceTotal = student.attendance.length;
      const attendancePresent = student.attendance.filter((item) => item.status === AttendanceStatus.PRESENT).length;
      const scoreTotal = student.academicRecords.reduce((sum, record) => sum + record.score, 0);
      return {
        id: student.id,
        student: `${student.firstName} ${student.lastName}`,
        firstName: student.firstName,
        lastName: student.lastName,
        course: student.course?.name ?? student.grade,
        institution: student.institution.name,
        municipality: student.institution.municipality.name,
        guardian: student.guardians[0]?.guardian.user.name ?? null,
        riskLevel: student.riskLevel,
        activeAlerts: student.alerts.length,
        attendanceRate: attendanceTotal === 0 ? 0 : Math.round((attendancePresent / attendanceTotal) * 100),
        academicAverage: student.academicRecords.length === 0 ? 0 : Number((scoreTotal / student.academicRecords.length).toFixed(2)),
        timeline: [
          ...student.alerts.map((alert) => ({ type: "alert", label: alert.description, date: alert.createdAt })),
          ...student.monitoringCases.map((item) => ({ type: "case", label: item.summary, date: item.openedAt }))
        ].sort((a, b) => b.date.getTime() - a.date.getTime())
      };
    });

    return { metrics, data, meta: { total, page: query.page, pageSize: query.pageSize } };
  }
}
