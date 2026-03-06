import '@fastify/cookie';
import { Args, Context, type GraphQLExecutionContext, Mutation, Resolver } from '@nestjs/graphql';
import { Public } from '@sandworm/nest-common';
import { type FastifyReply } from 'fastify';
import { AuthGraphqlService } from './auth-graphql.service';
import { LoginInput } from './dto/auth-graphql.dto';
import { AuthPayload } from './models/auth-payload';
import { AuthService } from '../core/auth.service';
import { setTokenCookies } from '../core/utils/cookie';

@Resolver()
export class AuthGraphqlResolver {
  constructor(
    private authGraphqlService: AuthGraphqlService,
    private authService: AuthService,
  ) { }

  @Public()
  @Mutation(() => AuthPayload, { name: 'login', description: 'Sign in' })
  async login(@Args('input') input: LoginInput,  @Context('response') res: FastifyReply,): Promise<AuthPayload> {
    console.log(res)
    let user = await this.authGraphqlService.login(input);
      // const { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires } = await this.authService.issueTokenPair(user.id);
      // setTokenCookies(res, { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires });
      return  user;
  }
}
