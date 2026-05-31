import { Controller, Post, Body, Get, Patch, Delete, Param, Query, UseGuards, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { AuthService } from './auth.service';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../user/schemas/user.schema';
import { CsrfGuard, SkipCsrf } from '../common/guards/csrf.guard';

const IS_PROD = process.env.NODE_ENV === 'production';

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @SkipCsrf()
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @SkipCsrf()
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, role } = await this.authService.login(dto);
    setAuthCookies(res, accessToken, refreshToken);
    return { role };
  }

  @Public()
  @SkipCsrf()
  @SkipThrottle()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.refreshToken;
    const { accessToken, refreshToken, role } = await this.authService.refresh(token);
    setAuthCookies(res, accessToken, refreshToken);
    return { role };
  }

  @Public()
  @SkipCsrf()
  @SkipThrottle()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', { httpOnly: true, secure: IS_PROD, sameSite: IS_PROD ? 'none' : 'lax' });
    res.clearCookie('refreshToken', { httpOnly: true, secure: IS_PROD, sameSite: IS_PROD ? 'none' : 'lax' });
    res.clearCookie('__csrf');
    return { success: true };
  }

  /** Mint a CSRF token — called on every page load, must not be rate-limited. */
  @Public()
  @SkipThrottle()
  @Get('csrf-token')
  csrfToken(@Res({ passthrough: true }) res: Response) {
    const token = CsrfGuard.issueToken(res, IS_PROD);
    return { csrfToken: token };
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @Patch('me')
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(userId, dto);
  }

  @Roles(Role.ADMIN)
  @Get('users')
  listUsers(@Query() query: ListUsersDto) {
    return this.authService.listUsers(query);
  }

  @Roles(Role.ADMIN)
  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() dto: { name?: string; phone?: string; isVerified?: boolean },
  ) {
    return this.authService.updateUserById(id, dto);
  }

  @Roles(Role.ADMIN)
  @Patch('users/:id/status')
  toggleUserStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.authService.toggleUserStatus(id, isActive);
  }

  @Roles(Role.ADMIN)
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('verify-otp')
  async verifyOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, role } = await this.authService.verifyOtp(email, otp);
    setAuthCookies(res, accessToken, refreshToken);
    return { role };
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('resend-otp')
  resendOtp(@Body('email') email: string) {
    return this.authService.resendOtp(email);
  }

  @Public()
  @SkipCsrf()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @SkipCsrf()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('reset-password')
  resetPassword(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(email, otp, newPassword);
  }

  @Roles(Role.ADMIN)
  @Post('create-vendor')
  createVendor(@Body() dto: { name: string; email: string; password: string; storeName: string }) {
    return this.authService.createVendorByAdmin(dto);
  }
}
