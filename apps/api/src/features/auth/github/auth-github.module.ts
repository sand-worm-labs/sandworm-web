import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGithubService } from '@/features/auth/github/auth-github.service';
import { AuthGithubController } from '@/features/auth/github/auth-github.controller';
import { AuthModule } from '@/features/auth/core/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [AuthGithubService],
  exports: [AuthGithubService],
  controllers: [AuthGithubController],
})
export class AuthGithubModule { }
