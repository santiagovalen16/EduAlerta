import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { AttendanceService } from "./attendance.service";
import { BulkAttendanceDto } from "./dto/bulk-attendance.dto";
import { QueryAttendanceDto } from "./dto/query-attendance.dto";
import { UpsertAttendanceDto } from "./dto/upsert-attendance.dto";

@ApiTags("attendance")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @Permissions("attendance:read")
  findMany(@Query() query: QueryAttendanceDto, @CurrentUser() user: CurrentUserPayload) {
    return this.attendanceService.findMany(query, user);
  }

  @Post()
  @Permissions("attendance:write")
  upsert(@Body() dto: UpsertAttendanceDto, @CurrentUser() user: CurrentUserPayload) {
    return this.attendanceService.upsert(dto, user);
  }

  @Post("bulk")
  @Permissions("attendance:write")
  bulk(@Body() dto: BulkAttendanceDto, @CurrentUser() user: CurrentUserPayload) {
    return this.attendanceService.bulk(dto, user);
  }
}
