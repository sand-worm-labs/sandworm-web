import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialInterface } from '@/features/social/interface/social.interface';
import { AuthGithubLoginDto } from '@/features/auth/github/dto/auth-github-login.dto';
import { AllConfigType } from '@/core/config/config.type';

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

@Injectable()
export class AuthGithubService {
  private readonly logger = new Logger(AuthGithubService.name);

  constructor(private configService: ConfigService<AllConfigType>) { }

  async getProfileByToken(
    loginDto: AuthGithubLoginDto,
  ): Promise<SocialInterface> {
    const githubConfig = this.configService.getOrThrow('github', { infer: true });

    try {
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${loginDto.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!userResponse.ok) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { user: 'wrongToken' },
        });
      }

      const userData: GitHubUser = await userResponse.json();

      if (!userData || !userData.id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { user: 'wrongToken' },
        });
      }

      let email = userData.email;
      if (!email) {
        email = await this.fetchPrimaryEmail(loginDto.accessToken);
      }

      const nameParts = userData.name?.split(' ') || [];
      const firstName = nameParts[0] || null;
      const lastName = nameParts.slice(1).join(' ') || null;

      return {
        id: userData.id.toString(),
        email,
        firstName,
        lastName,
      };
    } catch (error) {
      if (error instanceof UnprocessableEntityException) throw error;

      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { user: 'wrongToken' },
      });
    }
  }

  private async fetchPrimaryEmail(accessToken: string): Promise<string | null> {
    try {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!emailResponse.ok) return null;

      const emails: GitHubEmail[] = await emailResponse.json();

      const primaryEmail = emails.find((e) => e.primary && e.verified);
      if (primaryEmail) return primaryEmail.email;

      const verifiedEmail = emails.find((e) => e.verified);
      return verifiedEmail?.email || null;
    } catch (error) {
      this.logger.warn('Failed to fetch GitHub emails', error);
      return null;
    }
  }
}
