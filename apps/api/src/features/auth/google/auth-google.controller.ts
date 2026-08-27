import {
  Body,
  Controller,
  Post,
  Res,
  SerializeOptions,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { FastifyReply as FastifyReplyType } from 'fastify';
import { ApiPublic } from '@sandworm/api/decorators/http.decorators';
import { AuthService } from '@/features/auth/core/auth.service';
import { setTokenCookies } from '@/features/auth/core/utils/cookie';
import { AuthGoogleService } from './auth-google.service';
import { AuthGoogleLoginDto } from './dto/auth-google-login.dto';
import { LoginResponseDto } from '@/features/auth/core/dto/login-response.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth/google',
  version: '1',
})
export class AuthGoogleController {
  constructor(
    private readonly authService: AuthService,
    private readonly authGoogleService: AuthGoogleService,
  ) { }

  @SerializeOptions({
    groups: ['me'],
  })
  @ApiPublic({
    summary: 'Login or sign up with Google',
    type: LoginResponseDto,
  })
  @Post('login')
  async login(
    @Body() loginDto: AuthGoogleLoginDto,
    @Res({ passthrough: true }) response: FastifyReplyType,
  ): Promise<LoginResponseDto> {
    const socialData = await this.authGoogleService.getProfileByToken(loginDto);
    const { user, roles } = await this.authService.validateSocialLogin('google', socialData);

    const { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires } =
      await this.authService.issueTokenPair(user.id);
    setTokenCookies(response, { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires });

    return { user, roles };
  }
}
