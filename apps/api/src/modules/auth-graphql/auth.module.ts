import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@sandworm/postgresql-typeorm';
import { AuthGraphqlResolver } from './auth.resolver';
import { AuthGraphqlService } from './auth.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([UserEntity])],
  providers: [AuthGraphqlResolver, AuthGraphqlService],
  exports: [AuthGraphqlService],
})
export class AuthGraphqlModule { }
