import { Body, Controller, Get, Ip, Post, Headers, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() dto: LoginDto, @Ip() ipAddress: string, @Headers("user-agent") userAgent?: string) {
    return this.authService.login(dto, { ipAddress, userAgent });
  }

  @Post("register")
  register(@Body() dto: RegisterDto, @Ip() ipAddress: string, @Headers("user-agent") userAgent?: string) {
    return this.authService.register(dto, { ipAddress, userAgent });
  }

  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto, @Ip() ipAddress: string, @Headers("user-agent") userAgent?: string) {
    return this.authService.refresh(dto, { ipAddress, userAgent });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  logout(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.logout(user);
  }

  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post("verify-email")
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.me(user);
  }
}
