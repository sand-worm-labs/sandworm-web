import { Injectable } from '@nestjs/common';
import { LoginInput } from './dto/auth-graphql.dto';
import { AuthPayload } from './models/auth-payload';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { AuthService } from '../auth/auth.service';


@Injectable()
export class AuthGraphqlService {
  constructor(
    private readonly authService: AuthService, 
  ) {}

  async login(input: LoginInput): Promise<AuthPayload> {
    const { email, password } = input;
    
    const loginResponse = await this.authService.validateLogin({
      email,
      password,
    });

    return {
      id: loginResponse.user.id,
      tokenExpires: loginResponse.tokenExpires,
      token: loginResponse.token,
      user: loginResponse.user,
    };
  }

  async verifyAccessToken(token: string): Promise<JwtPayloadType> {
    return this.authService.verifyAccessTokenWithSession(token); 
  }
}
  