import { AuthModule } from '@/features/auth/core/auth.module';
import { UserModule } from '@/features/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthDynamicController } from './auth-dynamic.controller';
import { AuthDynamicService } from './auth-dynamic.service';

@Module({
  imports: [ConfigModule, JwtModule.register({}), AuthModule, UserModule],
  providers: [AuthDynamicService],
  controllers: [AuthDynamicController],
})
export class AuthDynamicModule {}
