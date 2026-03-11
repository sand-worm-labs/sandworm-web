import '@fastify/cookie';
import { type FastifyReply } from 'fastify';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Public } from '@sandworm/nest-common';
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
  @Mutation(() => AuthPayload , { name: 'login', description: 'Sign in' })
  async login(@Args('input') input: LoginInput,  @Context() ctx: any): Promise<AuthPayload> {
    let user = await this.authGraphqlService.login(input);
    const tokenPair = await this.authService.issueTokenPair(user.id);
    setTokenCookies(ctx.reply as FastifyReply, tokenPair);
    return  { ...user, token: process.env.NODE_ENV === 'development' ? tokenPair.accessToken : null };
  }
}
