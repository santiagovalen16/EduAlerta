import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ActivityService } from "./activity.service";

@ApiTags("activity")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("activity")
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  feed(@CurrentUser() user: CurrentUserPayload) {
    return this.activityService.feed(user);
  }
}
