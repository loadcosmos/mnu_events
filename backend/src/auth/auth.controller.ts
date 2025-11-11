import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, VerifyEmailDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 попытки за 60 секунд
  @Post('register')
  @ApiOperation({ summary: 'Register a new user (sends verification code to email)' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 попыток за 60 секунд (пользователь может ошибаться с кодом)
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 попыток за 60 секунд (дополнительно к 5-минутной защите в сервисе)
  @Post('resend-code')
  @ApiOperation({ summary: 'Resend verification code (5 min cooldown between sends)' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  @ApiResponse({ status: 400, description: 'Bad request or cooldown active' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async resendCode(@Body() body: { email: string }) {
    return this.authService.resendVerificationCode(body.email);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 попыток за 60 секунд
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or email not verified' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout() {
    return this.authService.logout();
  }

  @Public()
  @Get('email-status')
  @ApiOperation({ summary: 'Check email service configuration status (for debugging)' })
  @ApiResponse({ status: 200, description: 'Email service status' })
  async getEmailStatus() {
    return this.authService.getEmailServiceStatus();
  }
}
