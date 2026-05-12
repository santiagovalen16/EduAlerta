import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { AlertsService } from "./alerts.service";
import { CreateAlertDto } from "./dto/create-alert.dto";
import { QueryAlertsDto } from "./dto/query-alerts.dto";
import { UpdateAlertDto } from "./dto/update-alert.dto";

@ApiTags("alerts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("alerts")
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @Permissions("alert:read")
  findMany(@Query() query: QueryAlertsDto) {
    return this.alertsService.findMany(query);
  }

  @Get(":id")
  @Permissions("alert:read")
  findById(@Param("id") id: string) {
    return this.alertsService.findById(id);
  }

  @Post()
  @Permissions("alert:create")
  create(@Body() dto: CreateAlertDto, @CurrentUser() user: CurrentUserPayload) {
    return this.alertsService.create(dto, user);
  }

  @Patch(":id")
  @Permissions("alert:update")
  update(@Param("id") id: string, @Body() dto: UpdateAlertDto, @CurrentUser() user: CurrentUserPayload) {
    return this.alertsService.update(id, dto, user);
  }

  @Delete(":id")
  @Permissions("alert:update")
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.alertsService.remove(id, user);
  }
}
