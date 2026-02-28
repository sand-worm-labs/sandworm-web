import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { OrNeverType } from '@/common/types/or-never.type';
import { AllConfigType } from '@/config/config.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService<AllConfigType>) {
    const authConfig = configService.getOrThrow('auth', { infer: true });
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfig.secret,
    });
  }

  // Why we don't check if the user exists in the database:
  // https://github.com/brocoders/nestjs-boilerplate/blob/main/docs/auth.md#about-jwt-strategy
  public validate(payload: JwtPayloadType): OrNeverType<JwtPayloadType> {
    if (!payload.id) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
