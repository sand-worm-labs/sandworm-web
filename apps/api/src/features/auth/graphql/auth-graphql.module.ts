import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGraphqlResolver } from './auth-graphql.resolver';
import { AuthGraphqlService } from './auth-graphql.service';
import { AuthModule } from '@/features/auth/core/auth.module';
import { UserModule } from '@/features/user/user.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    JwtModule.register({}),
  ],
  providers: [AuthGraphqlResolver, AuthGraphqlService],
  exports: [AuthGraphqlService],
})
export class AuthGraphqlModule { }