import { Injectable } from '@nestjs/common';
import { LoginInput } from './dto/auth-graphql.dto';
import { AuthPayload } from './models/auth-payload';
import { AuthService } from '@/features/auth/core/auth.service';


@Injectable()
export class AuthGraphqlService {
  constructor(
    private readonly authService: AuthService,
  ) { }

  async login(input: LoginInput): Promise<AuthPayload> {
    const { email, password } = input;

    const loginResponse = await this.authService.validateLogin({
      email,
      password,
    });

    return {
      id: loginResponse.user.id, 
      user: loginResponse.user,
      roles: loginResponse.roles
    };
  }
}
