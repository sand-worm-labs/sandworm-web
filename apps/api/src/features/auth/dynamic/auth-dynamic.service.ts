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
import { createPublicKey, type JsonWebKey } from 'crypto';

type DynamicClaims = {
  sub: string;
  scope?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  verified_credentials?: {
    format: string;
    chain?: string;
    address?: string;
    email?: string;
  }[];
};

@Injectable()
export class AuthDynamicService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  // The environment's signing keys by key id, from its published JWKS. Fetched
  // again for a key id not seen yet (Dynamic rotates them), at most once a minute.
  private keys = new Map<string, string>();
  private keysFetchedAt = 0;

  private async keyFor(token: string): Promise<string | undefined> {
    const { publicKey, environmentId } =
      this.configService.get('dynamic', { infer: true }) ?? {};
    if (publicKey || !environmentId) return publicKey;

    const kid: string | undefined = this.jwtService.decode(token, {
      complete: true,
    })?.header?.kid;
    if (
      kid &&
      !this.keys.has(kid) &&
      Date.now() - this.keysFetchedAt > 60_000
    ) {
      this.keysFetchedAt = Date.now();
      const res = await fetch(
        `https://app.dynamic.xyz/api/v0/sdk/${environmentId}/.well-known/jwks`,
      );
      const { keys } = (await res.json()) as {
        keys: (JsonWebKey & { kid: string })[];
      };
      for (const key of keys)
        this.keys.set(
          key.kid,
          createPublicKey({ key, format: 'jwk' })
            .export({ type: 'spki', format: 'pem' })
            .toString(),
        );
    }
    return kid ? this.keys.get(kid) : undefined;
  }

  // The token is signed by Dynamic; the environment's public key checks it (signature and expiry), so only the token is believed
  async getProfileByToken(
    token: string,
  ): Promise<SocialInterface & { wallets: string[] }> {
    const { publicKey, environmentId } =
      this.configService.get('dynamic', { infer: true }) ?? {};
    if (!publicKey && !environmentId)
      throw new ServiceUnavailableException(
        'Sign-in with Dynamic is not set up',
      );

    const claims = await this.keyFor(token)
      .then(
        (key) =>
          key &&
          this.jwtService.verifyAsync<DynamicClaims>(token, {
            publicKey: key,
            algorithms: ['RS256'],
          }),
      )
      .catch(() => null);
    if (!claims?.scope?.includes('user:basic'))
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { user: 'wrongToken' },
      });

    return {
      id: claims.sub,
      // Only an email Dynamic verified: an existing account with that email is signed in, so a typed one can't be trusted
      email: claims.verified_credentials?.find((c) => c.format === 'email')
        ?.email,
      firstName: claims.given_name,
      lastName: claims.family_name,
      wallets: (claims.verified_credentials ?? [])
        .filter((c) => c.format === 'blockchain' && c.chain === 'eip155')
        .map((c) => c.address!.toLowerCase()),
    };
  }
}
