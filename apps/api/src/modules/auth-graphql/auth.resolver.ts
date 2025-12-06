import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Public } from '@sandworm/nest-common';
import { AuthGraphqlService } from './auth.service';
import { LoginInput } from './dto/auth.dto';
import { AuthPayload } from './models/auth-payload';

@Resolver()
export class AuthGraphqlResolver {
  constructor(private authService: AuthGraphqlService) {}

  @Public()
  @Mutation(() => AuthPayload, { name: 'login', description: 'Sign in' })
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input);
  }
}
