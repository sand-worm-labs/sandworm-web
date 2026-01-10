import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity, UserEntity } from '@sandworm/postgresql-typeorm';
import { UserModule } from '../user/user.module';
import { SessionService } from './session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionEntity, UserEntity]),
    UserModule,
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}