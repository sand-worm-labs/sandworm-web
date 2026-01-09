import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { SocialInterface } from '../social/interfaces/social.interface';
import { AuthGoogleLoginDto } from './dto/auth-google-login.dto';
import { AllConfigType } from '@/config/config.type';

@Injectable()
export class AuthGoogleService {
  private google: OAuth2Client;

  constructor(private configService: ConfigService<AllConfigType>) {
    const googleService = this.configService.get("google", { infer: true });
    this.google = new OAuth2Client(
      googleService.clientId,
      googleService.clientSecret,
    );
  }

  async getProfileByToken(
    loginDto: AuthGoogleLoginDto,
  ): Promise<SocialInterface> {
    const googleService = this.configService.getOrThrow("google", { infer: true });
    const ticket = await this.google.verifyIdToken({
      idToken: loginDto.idToken,
      audience: [googleService.clientId],
    });

    const data = ticket.getPayload();

    if (!data) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'wrongToken',
        },
      });
    }

    return {
      id: data.sub,
      email: data.email,
      firstName: data.given_name,
      lastName: data.family_name,
    };
  }
}
