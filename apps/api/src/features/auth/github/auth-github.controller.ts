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
import { AuthGithubService } from './auth-github.service';
import { AuthGithubLoginDto } from './dto/auth-github-login.dto';
import { LoginResponseDto } from '@/features/auth/core/dto/login-response.dto';


@ApiTags('Auth')
@Controller({
  path: 'auth/github',
  version: '1',
})
export class AuthGithubController {
  constructor(
    private readonly authService: AuthService,
    private readonly authGithubService: AuthGithubService,
  ) { }

  @SerializeOptions({
    groups: ['me'],
  })
  @ApiPublic({
    summary: 'Login or sign up with GitHub',
    type: LoginResponseDto,
  })
  @Post('login')
  async login(
    @Body() loginDto: AuthGithubLoginDto,
    @Res({ passthrough: true }) response: FastifyReplyType,
  ): Promise<LoginResponseDto> {
    const socialData = await this.authGithubService.getProfileByToken(loginDto);
    const { user, roles } = await this.authService.validateSocialLogin('github', socialData);

    const { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires } =
      await this.authService.issueTokenPair(user.id);
    setTokenCookies(response, { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires });

    return { user, roles };
  }
}
