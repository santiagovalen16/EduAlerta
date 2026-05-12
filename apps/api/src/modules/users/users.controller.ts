import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.me(user);
  }

  @Patch("me")
  updateMe(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe(user, dto);
  }

  @Patch("me/password")
  changePassword(@CurrentUser() user: CurrentUserPayload, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user, dto);
  }

  @Patch("me/preferences")
  updatePreferences(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(user, dto);
  }

  @Patch("me/onboarding")
  completeOnboarding(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.completeOnboarding(user, dto);
  }

  @Get("me/sessions")
  sessions(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.sessions(user);
  }

  @Delete("me/sessions/:id")
  revokeSession(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.usersService.revokeSession(user, id);
  }
}
