import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity, UserEntity } from '@sandworm/postgresql-typeorm';
import { UserModule } from '../user/user.module';
import { SessionService } from './session.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionEntity, UserEntity]),
    UserModule, ConfigModule, JwtModule.register({}),
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule { }