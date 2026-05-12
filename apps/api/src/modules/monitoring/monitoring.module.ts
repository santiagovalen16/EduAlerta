import { Module } from "@nestjs/common";
import { MonitoringController } from "./monitoring.controller";
import { MonitoringRepository } from "./monitoring.repository";
import { MonitoringService } from "./monitoring.service";

@Module({
  controllers: [MonitoringController],
  providers: [MonitoringService, MonitoringRepository]
})
export class MonitoringModule {}
