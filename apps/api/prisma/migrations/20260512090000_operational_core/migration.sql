-- CreateEnum
CREATE TYPE "ObservationCategory" AS ENUM ('BEHAVIOR', 'COEXISTENCE', 'ACADEMIC', 'COMMITMENT', 'POSITIVE', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "ObservationSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CaseEventType" AS ENUM ('CREATED', 'STATUS_CHANGED', 'COMMENTED', 'ASSIGNED', 'ACTION_ADDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AttachmentEntityType" AS ENUM ('OBSERVATION', 'INCIDENT', 'MONITORING_CASE', 'ALERT');

-- AlterEnum
BEGIN;
CREATE TYPE "AttendanceStatus_new" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'JUSTIFIED');
ALTER TABLE "Attendance" ALTER COLUMN "status" TYPE "AttendanceStatus_new" USING (
  CASE WHEN "status"::text = 'EXCUSED' THEN 'JUSTIFIED' ELSE "status"::text END
)::"AttendanceStatus_new";
ALTER TYPE "AttendanceStatus" RENAME TO "AttendanceStatus_old";
ALTER TYPE "AttendanceStatus_new" RENAME TO "AttendanceStatus";
DROP TYPE "public"."AttendanceStatus_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'CASE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'CASE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'CASE_COMMENTED';
ALTER TYPE "AuditAction" ADD VALUE 'CASE_STATUS_CHANGED';
ALTER TYPE "AuditAction" ADD VALUE 'ATTENDANCE_RECORDED';
ALTER TYPE "AuditAction" ADD VALUE 'OBSERVATION_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'INCIDENT_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'NOTIFICATION_READ';

-- AlterEnum
BEGIN;
CREATE TYPE "IncidentType_new" AS ENUM ('COEXISTENCE', 'BULLYING', 'AGGRESSION', 'NON_COMPLIANCE', 'ACADEMIC');
ALTER TABLE "Incident" ALTER COLUMN "type" TYPE "IncidentType_new" USING (
  CASE
    WHEN "type"::text IN ('BEHAVIOR', 'WELLBEING', 'FAMILY_CONTACT', 'ACADEMIC_SUPPORT') THEN 'COEXISTENCE'
    ELSE "type"::text
  END
)::"IncidentType_new";
ALTER TYPE "IncidentType" RENAME TO "IncidentType_old";
ALTER TYPE "IncidentType_new" RENAME TO "IncidentType";
DROP TYPE "public"."IncidentType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MonitoringCaseStatus_new" AS ENUM ('NEW', 'IN_REVIEW', 'ESCALATED', 'INTERVENTION', 'FOLLOW_UP', 'RESOLVED', 'CLOSED');
ALTER TABLE "public"."MonitoringCase" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "MonitoringCase" ALTER COLUMN "status" TYPE "MonitoringCaseStatus_new" USING (
  CASE
    WHEN "status"::text = 'OPEN' THEN 'NEW'
    WHEN "status"::text = 'IN_PROGRESS' THEN 'INTERVENTION'
    ELSE "status"::text
  END
)::"MonitoringCaseStatus_new";
ALTER TYPE "MonitoringCaseStatus" RENAME TO "MonitoringCaseStatus_old";
ALTER TYPE "MonitoringCaseStatus_new" RENAME TO "MonitoringCaseStatus";
DROP TYPE "public"."MonitoringCaseStatus_old";
ALTER TABLE "MonitoringCase" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "after" JSONB,
ADD COLUMN     "before" JSONB;

-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "evidenceNotes" TEXT,
ADD COLUMN     "institutionId" TEXT,
ADD COLUMN     "reportedById" TEXT,
ADD COLUMN     "resolution" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "severity" "ObservationSeverity" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "status" "MonitoringCaseStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "title" TEXT,
ADD COLUMN     "witnesses" TEXT;

UPDATE "Incident"
SET "institutionId" = "Student"."institutionId",
    "title" = COALESCE(NULLIF("Incident"."description", ''), 'Incidente institucional')
FROM "Student"
WHERE "Incident"."studentId" = "Student"."id";

ALTER TABLE "Incident" ALTER COLUMN "institutionId" SET NOT NULL;
ALTER TABLE "Incident" ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "MonitoringCase" ADD COLUMN     "actionsTaken" TEXT,
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "followUpAt" TIMESTAMP(3),
ADD COLUMN     "institutionId" TEXT,
ADD COLUMN     "priority" "AlertPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "title" TEXT,
ALTER COLUMN "status" SET DEFAULT 'NEW';

UPDATE "MonitoringCase"
SET "institutionId" = "Student"."institutionId",
    "title" = CONCAT('Caso de seguimiento ', "Student"."firstName", ' ', "Student"."lastName")
FROM "Student"
WHERE "MonitoringCase"."studentId" = "Student"."id";

ALTER TABLE "MonitoringCase" ALTER COLUMN "institutionId" SET NOT NULL;
ALTER TABLE "MonitoringCase" ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "Observation" ADD COLUMN     "category" "ObservationCategory" NOT NULL DEFAULT 'ACADEMIC',
ADD COLUMN     "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "institutionId" TEXT,
ADD COLUMN     "isPositive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "severity" "ObservationSeverity" NOT NULL DEFAULT 'LOW',
ADD COLUMN     "title" TEXT;

UPDATE "Observation"
SET "institutionId" = "Student"."institutionId",
    "title" = COALESCE(NULLIF("Observation"."description", ''), 'Observacion institucional')
FROM "Student"
WHERE "Observation"."studentId" = "Student"."id";

ALTER TABLE "Observation" ALTER COLUMN "institutionId" SET NOT NULL;
ALTER TABLE "Observation" ALTER COLUMN "title" SET NOT NULL;

-- CreateTable
CREATE TABLE "MonitoringCaseComment" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MonitoringCaseComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringCaseEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" "CaseEventType" NOT NULL,
    "fromStatus" "MonitoringCaseStatus",
    "toStatus" "MonitoringCaseStatus",
    "body" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoringCaseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "entityType" "AttachmentEntityType" NOT NULL,
    "caseId" TEXT,
    "observationId" TEXT,
    "incidentId" TEXT,
    "studentId" TEXT,
    "uploadedById" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonitoringCaseComment_caseId_idx" ON "MonitoringCaseComment"("caseId");

-- CreateIndex
CREATE INDEX "MonitoringCaseComment_authorId_idx" ON "MonitoringCaseComment"("authorId");

-- CreateIndex
CREATE INDEX "MonitoringCaseComment_createdAt_idx" ON "MonitoringCaseComment"("createdAt");

-- CreateIndex
CREATE INDEX "MonitoringCaseEvent_caseId_idx" ON "MonitoringCaseEvent"("caseId");

-- CreateIndex
CREATE INDEX "MonitoringCaseEvent_actorId_idx" ON "MonitoringCaseEvent"("actorId");

-- CreateIndex
CREATE INDEX "MonitoringCaseEvent_type_idx" ON "MonitoringCaseEvent"("type");

-- CreateIndex
CREATE INDEX "MonitoringCaseEvent_createdAt_idx" ON "MonitoringCaseEvent"("createdAt");

-- CreateIndex
CREATE INDEX "Attachment_entityType_idx" ON "Attachment"("entityType");

-- CreateIndex
CREATE INDEX "Attachment_caseId_idx" ON "Attachment"("caseId");

-- CreateIndex
CREATE INDEX "Attachment_observationId_idx" ON "Attachment"("observationId");

-- CreateIndex
CREATE INDEX "Attachment_incidentId_idx" ON "Attachment"("incidentId");

-- CreateIndex
CREATE INDEX "Attachment_studentId_idx" ON "Attachment"("studentId");

-- CreateIndex
CREATE INDEX "Attachment_uploadedById_idx" ON "Attachment"("uploadedById");

-- CreateIndex
CREATE INDEX "Incident_institutionId_idx" ON "Incident"("institutionId");

-- CreateIndex
CREATE INDEX "Incident_reportedById_idx" ON "Incident"("reportedById");

-- CreateIndex
CREATE INDEX "Incident_status_idx" ON "Incident"("status");

-- CreateIndex
CREATE INDEX "MonitoringCase_institutionId_idx" ON "MonitoringCase"("institutionId");

-- CreateIndex
CREATE INDEX "MonitoringCase_assignedToId_idx" ON "MonitoringCase"("assignedToId");

-- CreateIndex
CREATE INDEX "MonitoringCase_priority_idx" ON "MonitoringCase"("priority");

-- CreateIndex
CREATE INDEX "Observation_institutionId_idx" ON "Observation"("institutionId");

-- CreateIndex
CREATE INDEX "Observation_category_idx" ON "Observation"("category");

-- CreateIndex
CREATE INDEX "Observation_severity_idx" ON "Observation"("severity");

-- AddForeignKey
ALTER TABLE "MonitoringCase" ADD CONSTRAINT "MonitoringCase_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringCase" ADD CONSTRAINT "MonitoringCase_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringCase" ADD CONSTRAINT "MonitoringCase_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringCaseComment" ADD CONSTRAINT "MonitoringCaseComment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "MonitoringCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringCaseComment" ADD CONSTRAINT "MonitoringCaseComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringCaseEvent" ADD CONSTRAINT "MonitoringCaseEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "MonitoringCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringCaseEvent" ADD CONSTRAINT "MonitoringCaseEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "MonitoringCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
