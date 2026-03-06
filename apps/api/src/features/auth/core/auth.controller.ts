import { FastifyReply } from 'fastify';
import { type FastifyReply as FastifyReplyType } from 'fastify';
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
import { TokenPair } from './types/token.type';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { AllConfigType } from '@/core/config/config.type';


const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly service: AuthService, 
    private readonly configService: ConfigService<AllConfigType>
  ) { }
  
  public setTokenCookies(res: FastifyReply, tokens: TokenPair): void {
    const isProduction = this.configService.get('app.nodeEnv', { infer: true }) === 'production';

    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      expires: tokens.accessTokenExpires,
    });

    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite:  isProduction ? 'none' : 'strict',
      expires: tokens.refreshTokenExpires,
      path: '/auth/refresh', // scope refresh cookie to refresh endpoint only
    });
  }

  public clearTokenCookies(res: FastifyReply): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/auth/refresh' });
  }
  

  @Post('email/login')
  @SerializeOptions({ groups: ['me'] })
  @ApiPublic({
    summary: 'Login with email and password',
    type: LoginResponseDto,
  })
  public async login(@Body() loginDto: AuthEmailLoginDto, @Res({ passthrough: true }) response: FastifyReplyType): Promise<LoginResponseDto> {
    const { user, roles } = await this.service.validateLogin(loginDto);
    const { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires } = await this.service.issueTokenPair(user.id);
    this.setTokenCookies(response, { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires });
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
  public async refresh(@CurrentUser() user: { id: string;}): Promise<void> {
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
  public async logout(@Res({ passthrough: true }) response: FastifyReplyType): Promise<void> {
    this.clearTokenCookies(response);
    return;
  }
}