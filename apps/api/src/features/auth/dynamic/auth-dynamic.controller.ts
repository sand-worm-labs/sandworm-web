import { AuthProvidersEnum } from '@/common/enums/auth-providers.enum';
import { AuthService } from '@/features/auth/core/auth.service';
import { LoginResponseDto } from '@/features/auth/core/dto/login-response.dto';
import { setTokenCookies } from '@/features/auth/core/utils/cookie';
import { UserService } from '@/features/user/user.service';
import { Body, Controller, Post, Res, SerializeOptions } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiPublic } from '@sandworm/api/decorators/http.decorators';
import type { FastifyReply as FastifyReplyType } from 'fastify';
import { AuthDynamicService } from './auth-dynamic.service';
import { AuthDynamicLoginDto } from './dto/auth-dynamic-login.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth/dynamic',
  version: '1',
})
export class AuthDynamicController {
  constructor(
    private readonly authService: AuthService,
    private readonly authDynamicService: AuthDynamicService,
    private readonly userService: UserService,
  ) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @ApiPublic({
    summary:
      'Login or sign up with Dynamic (a wallet, or an email that comes with one). No password.',
    type: LoginResponseDto,
  })
  @Post('login')
  async login(
    @Body() loginDto: AuthDynamicLoginDto,
    @Res({ passthrough: true }) response: FastifyReplyType,
  ): Promise<LoginResponseDto> {
    const { wallets, ...profile } =
      await this.authDynamicService.getProfileByToken(loginDto.token);
    const { user, roles } = await this.authService.validateSocialLogin(
      AuthProvidersEnum.dynamic,
      profile,
    );

    // Keep the wallets Dynamic verified on the account, next to any it already has
    if (wallets.length) {
      const settings = await this.userService
        .getUserSettings(user.id)
        .catch(() => null);
      const known = new Set(
        (settings?.wallets ?? []).map((w) => w.address.toLowerCase()),
      );
      const added = wallets.filter((address) => !known.has(address));
      if (added.length)
        await this.userService.updateWallets(user.id, [
          ...(settings?.wallets ?? []),
          ...added.map((address) => ({ chain: 'ethereum', address })),
        ]);
    }

    const {
      accessToken,
      refreshToken,
      accessTokenExpires,
      refreshTokenExpires,
    } = await this.authService.issueTokenPair(user.id);
    setTokenCookies(response, {
      accessToken,
      refreshToken,
      accessTokenExpires,
      refreshTokenExpires,
    });

    return { user, roles };
  }
}
