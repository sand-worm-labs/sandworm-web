import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Public } from '@sandworm/nest-common';
import { AuthGraphqlService } from './auth-graphql.service';
import { LoginInput } from './dto/auth-graphql.dto';
import { AuthPayload } from './models/auth-payload';
import { UserService } from '../user/user.service';
import GraphQLJSON from 'graphql-type-json';

@Resolver()
export class AuthGraphqlResolver {
  constructor(
    private authService: AuthGraphqlService
  ) { }

  @Public()
  @Mutation(() => AuthPayload, { name: 'login', description: 'Sign in' })
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input);
  }
}
