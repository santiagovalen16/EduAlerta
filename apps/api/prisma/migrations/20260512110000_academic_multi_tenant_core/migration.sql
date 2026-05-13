-- DropIndex
DROP INDEX "AcademicRecord_subject_idx";

-- AlterTable
ALTER TABLE "AcademicRecord" ADD COLUMN     "subjectId" TEXT,
ADD COLUMN     "subjectName" TEXT;

UPDATE "AcademicRecord"
SET "subjectName" = COALESCE("subject", 'Sin materia');

ALTER TABLE "AcademicRecord" ALTER COLUMN "subjectName" SET NOT NULL;
ALTER TABLE "AcademicRecord" DROP COLUMN "subject";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "subjectId" TEXT;

-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "academicCalendar" JSONB,
ADD COLUMN     "levels" JSONB,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "primaryColor" TEXT,
ADD COLUMN     "shifts" JSONB;

-- AlterTable
ALTER TABLE "Observation" ALTER COLUMN "category" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherSubject" (
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TeacherSubject_pkey" PRIMARY KEY ("teacherId","subjectId")
);

-- CreateTable
CREATE TABLE "CourseSubject" (
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CourseSubject_pkey" PRIMARY KEY ("courseId","subjectId")
);

-- CreateTable
CREATE TABLE "TeacherAssignment" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TeacherAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentCourse" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StudentCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeBook" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "academicPeriodId" TEXT,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GradeBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subject_institutionId_idx" ON "Subject"("institutionId");

-- CreateIndex
CREATE INDEX "Subject_isActive_idx" ON "Subject"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_institutionId_name_key" ON "Subject"("institutionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_institutionId_code_key" ON "Subject"("institutionId", "code");

-- CreateIndex
CREATE INDEX "TeacherSubject_subjectId_idx" ON "TeacherSubject"("subjectId");

-- CreateIndex
CREATE INDEX "CourseSubject_subjectId_idx" ON "CourseSubject"("subjectId");

-- CreateIndex
CREATE INDEX "TeacherAssignment_institutionId_idx" ON "TeacherAssignment"("institutionId");

-- CreateIndex
CREATE INDEX "TeacherAssignment_teacherId_idx" ON "TeacherAssignment"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherAssignment_courseId_idx" ON "TeacherAssignment"("courseId");

-- CreateIndex
CREATE INDEX "TeacherAssignment_subjectId_idx" ON "TeacherAssignment"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAssignment_teacherId_courseId_subjectId_key" ON "TeacherAssignment"("teacherId", "courseId", "subjectId");

-- CreateIndex
CREATE INDEX "StudentCourse_studentId_idx" ON "StudentCourse"("studentId");

-- CreateIndex
CREATE INDEX "StudentCourse_courseId_idx" ON "StudentCourse"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentCourse_studentId_courseId_startsAt_key" ON "StudentCourse"("studentId", "courseId", "startsAt");

-- CreateIndex
CREATE INDEX "GradeBook_institutionId_idx" ON "GradeBook"("institutionId");

-- CreateIndex
CREATE INDEX "GradeBook_courseId_idx" ON "GradeBook"("courseId");

-- CreateIndex
CREATE INDEX "GradeBook_subjectId_idx" ON "GradeBook"("subjectId");

-- CreateIndex
CREATE INDEX "GradeBook_academicPeriodId_idx" ON "GradeBook"("academicPeriodId");

-- CreateIndex
CREATE INDEX "AcademicRecord_subjectId_idx" ON "AcademicRecord"("subjectId");

-- CreateIndex
CREATE INDEX "AcademicRecord_subjectName_idx" ON "AcademicRecord"("subjectName");

-- CreateIndex
CREATE INDEX "Attendance_studentId_courseId_subjectId_date_idx" ON "Attendance"("studentId", "courseId", "subjectId", "date");

-- CreateIndex
CREATE INDEX "Attendance_subjectId_date_idx" ON "Attendance"("subjectId", "date");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSubject" ADD CONSTRAINT "CourseSubject_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSubject" ADD CONSTRAINT "CourseSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCourse" ADD CONSTRAINT "StudentCourse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCourse" ADD CONSTRAINT "StudentCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicRecord" ADD CONSTRAINT "AcademicRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicRecord" ADD CONSTRAINT "AcademicRecord_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeBook" ADD CONSTRAINT "GradeBook_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeBook" ADD CONSTRAINT "GradeBook_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeBook" ADD CONSTRAINT "GradeBook_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeBook" ADD CONSTRAINT "GradeBook_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "AcademicPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;
