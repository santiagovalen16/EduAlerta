import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { QueryInvitationsDto } from "./dto/query-invitations.dto";
import { InvitationsService } from "./invitations.service";

@ApiTags("invitations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("invitations")
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get()
  @Permissions("user:manage")
  findMany(@Query() query: QueryInvitationsDto) {
    return this.invitationsService.findMany(query);
  }

  @Post()
  @Permissions("user:manage")
  create(@Body() dto: CreateInvitationDto, @CurrentUser() user: CurrentUserPayload) {
    return this.invitationsService.create(dto, user);
  }

  @Patch(":id/revoke")
  @Permissions("user:manage")
  revoke(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.invitationsService.revoke(id, user);
  }
}
