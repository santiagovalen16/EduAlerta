import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { QueryMonitoringDto } from "./dto/query-monitoring.dto";
import { MonitoringService } from "./monitoring.service";

@ApiTags("monitoring")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("monitoring")
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get()
  @Permissions("student:read")
  overview(@Query() query: QueryMonitoringDto) {
    return this.monitoringService.overview(query);
  }
}
