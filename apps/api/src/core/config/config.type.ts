import { AppConfig } from '@sandworm/graphql';
import { DatabaseConfig } from '@sandworm/postgresql-typeorm';
import { JupyterConfig } from '@sandworm/jupyter';
import { AuthConfig } from '@/features/auth/core/config/auth-config.type';
import { GoogleConfig } from '@/features/auth/google/config/google-config.type';
import { MailConfig } from '@/infrastructure/mail/config/mail-config.type';
import { GithubConfig } from "@/features/auth/github/config/github-config.type";
import { BlockExecutorConfig } from '@/features/block-executor/config/block-executor-config.type';
import { OpenRouterConfig } from "@/infrastructure/openrouter/config/openrouter-config.type";
import { AiServiceConfig } from '@/infrastructure/ai/config/ai-service-config.type';

export type AllConfigType = {
  app: AppConfig;
  ai:AiServiceConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
  jupyter: JupyterConfig;
  google: GoogleConfig;
  mail: MailConfig;
  github: GithubConfig,
  blockExecutor: BlockExecutorConfig
  openrouter: OpenRouterConfig
};