import { AllConfigType } from '@/core/config/config.type';
import { SocialInterface } from '@/features/social/interface/social.interface';
import {
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

type DynamicClaims = {
  sub: string;
  scope?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  verified_credentials?: { format: string; chain?: string; address?: string }[];
};

@Injectable()
export class AuthDynamicService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  // The token is signed by Dynamic; the environment's public key checks it (signature and expiry), so only the token is believed
  async getProfileByToken(
    token: string,
  ): Promise<SocialInterface & { wallets: string[] }> {
    const publicKey = this.configService.get('dynamic', {
      infer: true,
    })?.publicKey;
    if (!publicKey)
      throw new ServiceUnavailableException(
        'Sign-in with Dynamic is not set up',
      );

    const claims = await this.jwtService
      .verifyAsync<DynamicClaims>(token, { publicKey, algorithms: ['RS256'] })
      .catch(() => null);
    if (!claims?.scope?.includes('user:basic'))
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { user: 'wrongToken' },
      });

    return {
      id: claims.sub,
      email: claims.email,
      firstName: claims.given_name,
      lastName: claims.family_name,
      wallets: (claims.verified_credentials ?? [])
        .filter((c) => c.format === 'blockchain' && c.chain === 'eip155')
        .map((c) => c.address!.toLowerCase()),
    };
  }
}
