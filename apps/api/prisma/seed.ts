import {
  AlertStatus,
  AlertType,
  AttendanceStatus,
  IncidentType,
  AlertPriority,
  MonitoringCaseStatus,
  PrismaClient,
  RiskLevel,
  RoleKey
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const permissions = [
  ["alert:create", "Crear alertas academicas"],
  ["alert:read", "Leer alertas academicas"],
  ["alert:update", "Actualizar alertas academicas"],
  ["student:create", "Crear estudiantes"],
  ["student:read", "Leer estudiantes"],
  ["student:update", "Actualizar estudiantes"],
  ["student:delete", "Eliminar estudiantes"],
  ["dashboard:institution:read", "Leer dashboard institucional"],
  ["dashboard:territory:read", "Leer dashboard territorial"],
  ["report:export", "Exportar reportes"],
  ["user:manage", "Gestionar usuarios"],
  ["case:create", "Crear casos de seguimiento"],
  ["case:read", "Leer casos de seguimiento"],
  ["case:update", "Actualizar casos de seguimiento"],
  ["attendance:read", "Leer asistencia"],
  ["attendance:write", "Registrar asistencia"],
  ["academic:read", "Leer estructura academica"],
  ["academic:write", "Gestionar estructura academica"],
  ["observation:read", "Leer observaciones"],
  ["observation:create", "Crear observaciones"],
  ["incident:read", "Leer incidentes"],
  ["incident:create", "Crear incidentes"],
  ["rule:evaluate", "Ejecutar motor de alertas"]
] as const;

const rolePermissions: Record<RoleKey, string[]> = {
  SUPER_ADMIN: permissions.map(([key]) => key),
  RECTOR: [
    "alert:create",
    "alert:read",
    "alert:update",
    "student:create",
    "student:read",
    "student:update",
    "student:delete",
    "dashboard:institution:read",
    "report:export",
    "user:manage",
    "case:create",
    "case:read",
    "case:update",
    "attendance:read",
    "academic:read",
    "academic:write",
    "observation:read",
    "observation:create",
    "incident:read",
    "incident:create",
    "rule:evaluate"
  ],
  COORDINADOR: [
    "alert:create",
    "alert:read",
    "alert:update",
    "student:read",
    "student:update",
    "dashboard:institution:read",
    "case:create",
    "case:read",
    "case:update",
    "attendance:read",
    "academic:read",
    "academic:write",
    "observation:read",
    "observation:create",
    "incident:read",
    "incident:create"
  ],
  DOCENTE: ["alert:create", "alert:read", "alert:update", "student:read", "attendance:read", "attendance:write", "academic:read", "observation:read", "observation:create", "incident:read", "incident:create", "case:read"],
  SECRETARIA: ["student:read", "dashboard:territory:read", "report:export", "case:read", "attendance:read", "academic:read", "observation:read", "incident:read"],
  ACUDIENTE: ["student:read", "alert:read", "case:read", "attendance:read", "observation:read"],
  ESTUDIANTE: ["student:read", "alert:read", "attendance:read", "observation:read"]
};

async function upsertUser(input: {
  email: string;
  name: string;
  role: RoleKey;
  institutionId?: string;
  passwordHash: string;
}) {
  const role = await prisma.role.findUniqueOrThrow({ where: { key: input.role } });
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      roleId: role.id,
      institutionId: input.institutionId,
      deletedAt: null,
      disabledAt: null
    },
    create: {
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      roleId: role.id,
      institutionId: input.institutionId
    }
  });
}

async function main() {
  for (const [key, description] of permissions) {
    await prisma.permission.upsert({
      where: { key },
      update: { description, deletedAt: null },
      create: { key, description }
    });
  }

  for (const roleKey of Object.values(RoleKey)) {
    const role = await prisma.role.upsert({
      where: { key: roleKey },
      update: { deletedAt: null },
      create: {
        key: roleKey,
        name: roleKey.toLowerCase(),
        description: `Perfil ${roleKey.toLowerCase()} de EduAlerta`
      }
    });

    for (const permissionKey of rolePermissions[roleKey]) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { key: permissionKey } });
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id
        }
      });
    }
  }

  const department = await prisma.department.upsert({
    where: { name: "Cundinamarca" },
    update: { daneCode: "25", deletedAt: null },
    create: { name: "Cundinamarca", daneCode: "25" }
  });

  const municipalities = await Promise.all(
    [
      { name: "Chia", daneCode: "25175", latitude: 4.8614, longitude: -74.0581 },
      { name: "Cajica", daneCode: "25126", latitude: 4.9186, longitude: -74.0277 },
      { name: "Zipaquira", daneCode: "25899", latitude: 5.0221, longitude: -74.0048 }
    ].map((municipality) =>
      prisma.municipality.upsert({
        where: { name: municipality.name },
        update: { ...municipality, departmentId: department.id, deletedAt: null },
        create: { ...municipality, departmentId: department.id }
      })
    )
  );

  const [chia, cajica] = municipalities;

  const institution = await prisma.institution.upsert({
    where: { daneCode: "25175-EDU-001" },
    update: {
      name: "Institucion Educativa Oficial Sabana Centro",
      address: "Carrera 7 # 12-45",
      municipalityId: chia.id,
      deletedAt: null
    },
    create: {
      name: "Institucion Educativa Oficial Sabana Centro",
      daneCode: "25175-EDU-001",
      address: "Carrera 7 # 12-45",
      municipalityId: chia.id
    }
  });

  await prisma.institution.upsert({
    where: { daneCode: "25126-EDU-002" },
    update: {
      name: "Colegio Departamental Cajica",
      address: "Calle 3 # 5-18",
      municipalityId: cajica.id,
      deletedAt: null
    },
    create: {
      name: "Colegio Departamental Cajica",
      daneCode: "25126-EDU-002",
      address: "Calle 3 # 5-18",
      municipalityId: cajica.id
    }
  });

  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  const admin = await upsertUser({
    email: "admin@edualerta.gov.co",
    name: "Administradora Plataforma",
    role: RoleKey.SUPER_ADMIN,
    institutionId: institution.id,
    passwordHash
  });
  const directivo = await upsertUser({
    email: "directivo@edualerta.gov.co",
    name: "Mariana Torres",
    role: RoleKey.RECTOR,
    institutionId: institution.id,
    passwordHash
  });
  const docenteMatematicas = await upsertUser({
    email: "docente.matematicas@edualerta.gov.co",
    name: "Carlos Ramirez",
    role: RoleKey.DOCENTE,
    institutionId: institution.id,
    passwordHash
  });
  const docenteOrientacion = await upsertUser({
    email: "orientacion@edualerta.gov.co",
    name: "Paula Gomez",
    role: RoleKey.DOCENTE,
    institutionId: institution.id,
    passwordHash
  });
  const guardianUser = await upsertUser({
    email: "acudiente@edualerta.gov.co",
    name: "Diana Medina",
    role: RoleKey.ACUDIENTE,
    institutionId: institution.id,
    passwordHash
  });
  const secretariaUser = await upsertUser({
    email: "secretaria@edualerta.gov.co",
    name: "Angela Pardo",
    role: RoleKey.SECRETARIA,
    institutionId: institution.id,
    passwordHash
  });
  const coordinadorUser = await upsertUser({
    email: "coordinador@edualerta.gov.co",
    name: "Julian Navarro",
    role: RoleKey.COORDINADOR,
    institutionId: institution.id,
    passwordHash
  });

  void admin;
  void directivo;

  for (const user of [
    { id: admin.id, roleKey: RoleKey.SUPER_ADMIN },
    { id: directivo.id, roleKey: RoleKey.RECTOR },
    { id: docenteMatematicas.id, roleKey: RoleKey.DOCENTE },
    { id: docenteOrientacion.id, roleKey: RoleKey.DOCENTE },
    { id: guardianUser.id, roleKey: RoleKey.ACUDIENTE },
    { id: secretariaUser.id, roleKey: RoleKey.SECRETARIA },
    { id: coordinadorUser.id, roleKey: RoleKey.COORDINADOR }
  ]) {
    await prisma.institutionUser.upsert({
      where: { institutionId_userId_roleKey: { institutionId: institution.id, userId: user.id, roleKey: user.roleKey } },
      update: { deletedAt: null },
      create: { institutionId: institution.id, userId: user.id, roleKey: user.roleKey }
    });
  }

  await prisma.secretary.upsert({
    where: { userId: secretariaUser.id },
    update: { institutionId: institution.id, municipalityId: chia.id, deletedAt: null },
    create: { userId: secretariaUser.id, institutionId: institution.id, municipalityId: chia.id }
  });

  await prisma.coordinator.upsert({
    where: { userId: coordinadorUser.id },
    update: { institutionId: institution.id, deletedAt: null },
    create: { userId: coordinadorUser.id, institutionId: institution.id }
  });

  const teacherMath = await prisma.teacher.upsert({
    where: { userId: docenteMatematicas.id },
    update: { institutionId: institution.id, specialty: "Matematicas", deletedAt: null },
    create: { userId: docenteMatematicas.id, institutionId: institution.id, specialty: "Matematicas" }
  });

  const teacherOrientation = await prisma.teacher.upsert({
    where: { userId: docenteOrientacion.id },
    update: { institutionId: institution.id, specialty: "Orientacion escolar", deletedAt: null },
    create: { userId: docenteOrientacion.id, institutionId: institution.id, specialty: "Orientacion escolar" }
  });

  const guardian = await prisma.guardian.upsert({
    where: { userId: guardianUser.id },
    update: { institutionId: institution.id, phone: "+57 300 456 7890", relationship: "Madre", deletedAt: null },
    create: {
      userId: guardianUser.id,
      institutionId: institution.id,
      phone: "+57 300 456 7890",
      relationship: "Madre"
    }
  });

  const mathSubject = await prisma.subject.upsert({
    where: { institutionId_name: { institutionId: institution.id, name: "Matematicas" } },
    update: { code: "MAT", isActive: true, deletedAt: null },
    create: { institutionId: institution.id, name: "Matematicas", code: "MAT" }
  });

  const languageSubject = await prisma.subject.upsert({
    where: { institutionId_name: { institutionId: institution.id, name: "Lenguaje" } },
    update: { code: "LEN", isActive: true, deletedAt: null },
    create: { institutionId: institution.id, name: "Lenguaje", code: "LEN" }
  });

  const scienceSubject = await prisma.subject.upsert({
    where: { institutionId_name: { institutionId: institution.id, name: "Ciencias" } },
    update: { code: "SCI", isActive: true, deletedAt: null },
    create: { institutionId: institution.id, name: "Ciencias", code: "SCI" }
  });

  const socialSubject = await prisma.subject.upsert({
    where: { institutionId_name: { institutionId: institution.id, name: "Sociales" } },
    update: { code: "SOC", isActive: true, deletedAt: null },
    create: { institutionId: institution.id, name: "Sociales", code: "SOC" }
  });

  const course82 = await prisma.course.upsert({
    where: { institutionId_name_academicYear: { institutionId: institution.id, name: "8-2", academicYear: 2026 } },
    update: { grade: "8", teacherId: teacherMath.id, deletedAt: null },
    create: {
      name: "8-2",
      grade: "8",
      academicYear: 2026,
      institutionId: institution.id,
      teacherId: teacherMath.id
    }
  });

  const course91 = await prisma.course.upsert({
    where: { institutionId_name_academicYear: { institutionId: institution.id, name: "9-1", academicYear: 2026 } },
    update: { grade: "9", teacherId: teacherOrientation.id, deletedAt: null },
    create: {
      name: "9-1",
      grade: "9",
      academicYear: 2026,
      institutionId: institution.id,
      teacherId: teacherOrientation.id
    }
  });

  for (const subject of [mathSubject, languageSubject, scienceSubject, socialSubject]) {
    await prisma.courseSubject.upsert({
      where: { courseId_subjectId: { courseId: course82.id, subjectId: subject.id } },
      update: { deletedAt: null },
      create: { courseId: course82.id, subjectId: subject.id }
    });
    await prisma.courseSubject.upsert({
      where: { courseId_subjectId: { courseId: course91.id, subjectId: subject.id } },
      update: { deletedAt: null },
      create: { courseId: course91.id, subjectId: subject.id }
    });
  }

  await prisma.teacherSubject.upsert({
    where: { teacherId_subjectId: { teacherId: teacherMath.id, subjectId: mathSubject.id } },
    update: { deletedAt: null },
    create: { teacherId: teacherMath.id, subjectId: mathSubject.id }
  });
  await prisma.teacherSubject.upsert({
    where: { teacherId_subjectId: { teacherId: teacherOrientation.id, subjectId: languageSubject.id } },
    update: { deletedAt: null },
    create: { teacherId: teacherOrientation.id, subjectId: languageSubject.id }
  });

  for (const [teacherId, courseId, subjectId] of [
    [teacherMath.id, course82.id, mathSubject.id],
    [teacherMath.id, course91.id, mathSubject.id],
    [teacherOrientation.id, course82.id, languageSubject.id],
    [teacherOrientation.id, course91.id, languageSubject.id]
  ]) {
    await prisma.teacherCourse.upsert({
      where: { teacherId_courseId: { teacherId, courseId } },
      update: { deletedAt: null },
      create: { teacherId, courseId }
    });
    await prisma.teacherAssignment.upsert({
      where: { teacherId_courseId_subjectId: { teacherId, courseId, subjectId } },
      update: { institutionId: institution.id, deletedAt: null },
      create: { institutionId: institution.id, teacherId, courseId, subjectId }
    });
  }

  const students = await Promise.all(
    [
      ["Laura", "Medina", "100100001", "8", RiskLevel.CRITICAL, course82.id],
      ["Mateo", "Cardenas", "100100002", "9", RiskLevel.HIGH, course91.id],
      ["Sara", "Rojas", "100100003", "8", RiskLevel.MEDIUM, course82.id],
      ["Nicolas", "Herrera", "100100004", "9", RiskLevel.LOW, course91.id],
      ["Valentina", "Suarez", "100100005", "8", RiskLevel.HIGH, course82.id],
      ["Emmanuel", "Castro", "100100006", "9", RiskLevel.MEDIUM, course91.id]
    ].map(([firstName, lastName, documentNumber, grade, riskLevel, courseId]) =>
      prisma.student.upsert({
        where: { documentNumber: documentNumber as string },
        update: {
          firstName: firstName as string,
          lastName: lastName as string,
          grade: grade as string,
          riskLevel: riskLevel as RiskLevel,
          institutionId: institution.id,
          courseId: courseId as string,
          deletedAt: null
        },
        create: {
          firstName: firstName as string,
          lastName: lastName as string,
          documentNumber: documentNumber as string,
          grade: grade as string,
          riskLevel: riskLevel as RiskLevel,
          institutionId: institution.id,
          courseId: courseId as string
        }
      })
    )
  );

  for (const student of students) {
    if (student.courseId) {
      await prisma.studentCourse.upsert({
        where: { studentId_courseId_startsAt: { studentId: student.id, courseId: student.courseId, startsAt: new Date("2026-01-15T00:00:00.000Z") } },
        update: { endsAt: null, deletedAt: null },
        create: { studentId: student.id, courseId: student.courseId, startsAt: new Date("2026-01-15T00:00:00.000Z") }
      });
    }
  }

  await prisma.studentGuardian.upsert({
    where: { guardianId_studentId: { guardianId: guardian.id, studentId: students[0].id } },
    update: {},
    create: { guardianId: guardian.id, studentId: students[0].id }
  });

  const alertRows = [
    {
      studentId: students[0].id,
      teacherId: teacherMath.id,
      createdById: docenteMatematicas.id,
      type: AlertType.ATTENDANCE,
      status: AlertStatus.ESCALATED,
      priority: AlertPriority.CRITICAL,
      description: "Acumula ausencias no justificadas durante las ultimas dos semanas."
    },
    {
      studentId: students[1].id,
      teacherId: teacherMath.id,
      createdById: docenteMatematicas.id,
      type: AlertType.ACADEMIC,
      status: AlertStatus.IN_REVIEW,
      priority: AlertPriority.HIGH,
      description: "Desempeno bajo sostenido en matematicas y entrega incompleta de actividades."
    },
    {
      studentId: students[4].id,
      teacherId: teacherOrientation.id,
      createdById: docenteOrientacion.id,
      type: AlertType.FAMILY,
      status: AlertStatus.NEW,
      priority: AlertPriority.MEDIUM,
      description: "No se ha logrado contacto efectivo con acudiente para seguimiento academico."
    }
  ];

  for (const [index, alert] of alertRows.entries()) {
    const created = await prisma.alert.upsert({
      where: { clientGeneratedId: `00000000-0000-4000-8000-00000000000${index + 1}` },
      update: { ...alert, deletedAt: null },
      create: {
        clientGeneratedId: `00000000-0000-4000-8000-00000000000${index + 1}`,
        ...alert
      }
    });

    if (index === 0) {
      await prisma.notification.create({
        data: {
          guardianId: guardian.id,
          alertId: created.id,
          title: "Seguimiento prioritario de asistencia",
          body: "La institucion solicita comunicacion con acudiente para revisar ausencias recientes.",
          status: "SENT"
        }
      });
    }
  }

  const attendanceDates = [0, 1, 2, 3, 4].map((offset) => {
    const date = new Date("2026-05-04T12:00:00.000Z");
    date.setDate(date.getDate() + offset);
    return date;
  });

  for (const student of students) {
    for (const [index, date] of attendanceDates.entries()) {
      const absent = student.riskLevel !== RiskLevel.LOW && index === 1;
      await prisma.attendance.upsert({
        where: {
          studentId_courseId_date: {
            studentId: student.id,
            courseId: student.courseId ?? course82.id,
            date
          }
        },
        update: { status: absent ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT, deletedAt: null },
        create: {
          studentId: student.id,
          courseId: student.courseId ?? course82.id,
          date,
          status: absent ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT
        }
      });
    }
  }

  await prisma.incident.upsert({
    where: { id: "00000000-0000-4000-9000-000000000001" },
    update: {
      studentId: students[0].id,
      teacherId: teacherOrientation.id,
      type: IncidentType.COEXISTENCE,
      institutionId: students[0].institutionId,
      title: "Seguimiento de convivencia familiar",
      description: "Se programa cita de orientacion con acudiente por ausentismo recurrente.",
      occurredAt: new Date("2026-05-08T14:30:00.000Z"),
      deletedAt: null
    },
    create: {
      id: "00000000-0000-4000-9000-000000000001",
      studentId: students[0].id,
      teacherId: teacherOrientation.id,
      type: IncidentType.COEXISTENCE,
      institutionId: students[0].institutionId,
      title: "Seguimiento de convivencia familiar",
      description: "Se programa cita de orientacion con acudiente por ausentismo recurrente.",
      occurredAt: new Date("2026-05-08T14:30:00.000Z")
    }
  });

  const subjects = [mathSubject, languageSubject, scienceSubject, socialSubject];
  for (const student of students) {
    for (const [index, subject] of subjects.entries()) {
      await prisma.academicRecord.upsert({
        where: { id: `00000000-0000-5000-8000-${student.documentNumber?.slice(-6)}${index}` },
        update: {
          score: student.riskLevel === RiskLevel.LOW ? 4.2 : student.riskLevel === RiskLevel.MEDIUM ? 3.4 : 2.8,
          deletedAt: null
        },
        create: {
          id: `00000000-0000-5000-8000-${student.documentNumber?.slice(-6)}${index}`,
          studentId: student.id,
          courseId: student.courseId,
          subjectId: subject.id,
          subjectName: subject.name,
          period: "2026-I",
          score: student.riskLevel === RiskLevel.LOW ? 4.2 : student.riskLevel === RiskLevel.MEDIUM ? 3.4 : 2.8
        }
      });
    }

    if (student.riskLevel !== RiskLevel.LOW) {
      await prisma.monitoringCase.upsert({
        where: { id: `00000000-0000-6000-8000-${student.documentNumber?.slice(-6)}0` },
        update: {
          institutionId: student.institutionId,
          title: `Caso de seguimiento ${student.firstName} ${student.lastName}`,
          status: student.riskLevel === RiskLevel.CRITICAL ? MonitoringCaseStatus.INTERVENTION : MonitoringCaseStatus.IN_REVIEW,
          priority: student.riskLevel === RiskLevel.CRITICAL ? AlertPriority.CRITICAL : AlertPriority.HIGH,
          riskLevel: student.riskLevel,
          summary: `Plan de acompanamiento activo para estudiante con riesgo ${student.riskLevel.toLowerCase()}.`,
          deletedAt: null
        },
        create: {
          id: `00000000-0000-6000-8000-${student.documentNumber?.slice(-6)}0`,
          studentId: student.id,
          openedById: directivo.id,
          institutionId: student.institutionId,
          title: `Caso de seguimiento ${student.firstName} ${student.lastName}`,
          status: student.riskLevel === RiskLevel.CRITICAL ? MonitoringCaseStatus.INTERVENTION : MonitoringCaseStatus.IN_REVIEW,
          priority: student.riskLevel === RiskLevel.CRITICAL ? AlertPriority.CRITICAL : AlertPriority.HIGH,
          riskLevel: student.riskLevel,
          summary: `Plan de acompanamiento activo para estudiante con riesgo ${student.riskLevel.toLowerCase()}.`
        }
      });
    }
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
