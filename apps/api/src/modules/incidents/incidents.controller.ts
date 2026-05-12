import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { QueryIncidentsDto } from "./dto/query-incidents.dto";
import { IncidentsService } from "./incidents.service";

@ApiTags("incidents")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("incidents")
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  @Permissions("incident:read")
  findMany(@Query() query: QueryIncidentsDto, @CurrentUser() user: CurrentUserPayload) {
    return this.incidentsService.findMany(query, user);
  }

  @Post()
  @Permissions("incident:create")
  create(@Body() dto: CreateIncidentDto, @CurrentUser() user: CurrentUserPayload) {
    return this.incidentsService.create(dto, user);
  }
}
