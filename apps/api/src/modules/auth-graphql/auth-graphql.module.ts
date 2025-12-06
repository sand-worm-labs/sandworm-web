import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@sandworm/postgresql-typeorm';
import { AuthGraphqlResolver } from './auth-graphql.resolver';
import { AuthGraphqlService } from './auth-graphql.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule ,JwtModule.register({}), TypeOrmModule.forFeature([UserEntity])],
  providers: [AuthGraphqlResolver, AuthGraphqlService],
  exports: [AuthGraphqlService],
})
export class AuthGraphqlModule {}
