import { Controller, Get, Patch, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { NotificationsService } from "./notifications.service";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMany(@CurrentUser() user: CurrentUserPayload) {
    return this.notificationsService.findMany(user);
  }

  @Get("unread-count")
  unreadCount(@CurrentUser() user: CurrentUserPayload) {
    return this.notificationsService.unreadCount(user);
  }

  @Patch(":id/read")
  markRead(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.notificationsService.markRead(id, user);
  }
}
