import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { AuditLogsModule } from "./modules/audit-logs/audit-logs.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { DatabaseModule } from "./database/database.module";
import { AlertsModule } from "./modules/alerts/alerts.module";
import { StudentsModule } from "./modules/students/students.module";
import { TerritorialModule } from "./modules/territorial/territorial.module";
import { MonitoringModule } from "./modules/monitoring/monitoring.module";
import { UsersModule } from "./modules/users/users.module";
import { InvitationsModule } from "./modules/invitations/invitations.module";
import { PublicModule } from "./modules/public/public.module";
import { CasesModule } from "./modules/cases/cases.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { ObservationsModule } from "./modules/observations/observations.module";
import { IncidentsModule } from "./modules/incidents/incidents.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ActivityModule } from "./modules/activity/activity.module";
import { SearchModule } from "./modules/search/search.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { RulesModule } from "./modules/rules/rules.module";
import { AcademicModule } from "./modules/academic/academic.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ["../../.env", ".env"],
      isGlobal: true
    }),
    DatabaseModule,
    PublicModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    AlertsModule,
    AcademicModule,
    CasesModule,
    AttendanceModule,
    ObservationsModule,
    IncidentsModule,
    NotificationsModule,
    DashboardModule,
    AuditLogsModule,
    ActivityModule,
    SearchModule,
    ReportsModule,
    RulesModule,
    TerritorialModule,
    MonitoringModule,
    InvitationsModule
  ]
})
export class AppModule {}
