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
    DashboardModule,
    AuditLogsModule,
    TerritorialModule,
    MonitoringModule,
    InvitationsModule
  ]
})
export class AppModule {}
