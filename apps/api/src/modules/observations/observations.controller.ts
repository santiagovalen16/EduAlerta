import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { CreateObservationDto } from "./dto/create-observation.dto";
import { QueryObservationsDto } from "./dto/query-observations.dto";
import { ObservationsService } from "./observations.service";

@ApiTags("observations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("observations")
export class ObservationsController {
  constructor(private readonly observationsService: ObservationsService) {}

  @Get()
  @Permissions("observation:read")
  findMany(@Query() query: QueryObservationsDto, @CurrentUser() user: CurrentUserPayload) {
    return this.observationsService.findMany(query, user);
  }

  @Post()
  @Permissions("observation:create")
  create(@Body() dto: CreateObservationDto, @CurrentUser() user: CurrentUserPayload) {
    return this.observationsService.create(dto, user);
  }
}
