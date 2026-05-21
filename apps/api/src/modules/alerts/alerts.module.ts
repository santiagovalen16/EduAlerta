import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { AlertsController } from "./alerts.controller";
import { AlertsRepository } from "./alerts.repository";
import { AlertsService } from "./alerts.service";

@Module({
  imports: [NotificationsModule],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsRepository]
})
export class AlertsModule {}
