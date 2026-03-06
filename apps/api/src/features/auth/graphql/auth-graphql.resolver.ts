import { Res } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Public } from '@sandworm/nest-common';
import { type FastifyReply as FastifyReplyType } from 'fastify';
import { AuthGraphqlService } from './auth-graphql.service';
import { LoginInput } from './dto/auth-graphql.dto';
import { AuthPayload } from './models/auth-payload';
import { AuthService } from '../core/auth.service';
import { AuthController } from '../core/auth.controller';

@Resolver()
export class AuthGraphqlResolver {
  constructor(
    private authGraphqlService: AuthGraphqlService,
    private authService: AuthService,
    private authController: AuthController
  ) { }

  @Public()
  @Mutation(() => AuthPayload, { name: 'login', description: 'Sign in' })
  async login(@Args('input') input: LoginInput, @Res({ passthrough: true }) response: FastifyReplyType): Promise<AuthPayload> {
    let user = await this.authGraphqlService.login(input);
    const { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires } = await this.authService.issueTokenPair(user.id);
    this.authController.setTokenCookies(response, { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires });
    return 
  }
}
