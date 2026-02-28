import {
  Body,
  Controller,
  Post,
  Res,
  SerializeOptions,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiPublic } from '@sandworm/api/decorators/http.decorators';
import { AuthService } from './auth.service';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CurrentUser } from '@sandworm/api/decorators/current-user.decorator';
import { type FastifyReply } from 'fastify';
import { clearAuthCookies, setAuthCookies } from './utils/response.util';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) { }

  @Post('email/login')
  @SerializeOptions({ groups: ['me'] })
  @ApiPublic({
    summary: 'Login with email and password',
    type: LoginResponseDto,
  })
  public async login(@Body() loginDto: AuthEmailLoginDto, @Res({ passthrough: true }) response: FastifyReply): Promise<LoginResponseDto> {
    const { user, roles } = await this.service.validateLogin(loginDto);
   // setAuthCookies(response, token, refreshToken, tokenExpires - Date.now());
    return { user, roles };
  }

  @Post('email/register')
  @ApiPublic({
    summary: 'Register a new user',
    statusCode: 200,
  })
  async register(@Body() createUserDto: AuthRegisterLoginDto): Promise<void> {
    return this.service.register(createUserDto);
  }

  @Post('email/confirm')
  @ApiPublic({
    summary: 'Confirm email address',
    statusCode: 204,
  })
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.service.confirmEmail(confirmEmailDto.hash);
  }

  @Post('email/confirm/new')
  @ApiPublic({
    summary: 'Confirm new email address',
    statusCode: 204,
  })
  async confirmNewEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.service.confirmNewEmail(confirmEmailDto.hash);
  }

  @Post('forgot/password')
  @ApiPublic({
    summary: 'Request password reset',
    statusCode: 204,
  })
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.service.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset/password')
  @ApiPublic({
    summary: 'Reset password with token',
    statusCode: 204,
  })
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.service.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  @Post('refresh')
  @SerializeOptions({ groups: ['me'] })
  @ApiAuth({
    summary: 'Refresh access token',
  })
  public async refresh(@CurrentUser() user: { id: string;},  @Res({ passthrough: true }) response: FastifyReply,): Promise<void> {
    // return this.service.refreshToken({
    //   sessionId: user.sessionId,
    //   hash: user.hash,
    // });
    //setAuthCookies(response, token, refreshToken, tokenExpires - Date.now());
    return
  }

  @Post('logout')
  @ApiAuth({
    summary: 'Logout current user',
    statusCode: 204,
  })
  public async logout( @Res({ passthrough: true }) res: FastifyReply): Promise<void> {
    clearAuthCookies(res);
    return;
  }
}