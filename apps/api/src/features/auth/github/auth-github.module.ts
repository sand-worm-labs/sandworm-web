import { Module } from '@nestjs/common';
import { AuthGithubService } from './auth-github.service';
import { ConfigModule } from '@nestjs/config';
import { AuthGithubController } from './auth-github.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [AuthGithubService],
  exports: [AuthGithubService],
  controllers: [AuthGithubController],
})
export class AuthGithubModule {}