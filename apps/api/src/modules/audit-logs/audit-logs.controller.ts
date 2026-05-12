import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuditLogsService } from "./audit-logs.service";

@ApiTags("audit-logs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("audit-logs")
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get("me")
  myActivity(@CurrentUser() user: CurrentUserPayload) {
    return this.auditLogsService.findForUser(user);
  }
}
