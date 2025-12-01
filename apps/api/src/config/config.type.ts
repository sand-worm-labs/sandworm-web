import { AppConfig } from '@sandworm/graphql';
import { DatabaseConfig } from '@sandworm/postgresql-typeorm';
import {JupyterConfig} from '@sandworm/jupyter';
import { RedisConfig } from '@sandworm/redis';
import { AuthConfig } from '@/api/auth/config/auth-config.type';
import { GoogleConfig } from '@/api/auth-google/config/google-config.type';
import { MailConfig } from '@/api/mail/config/mail-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  redis:RedisConfig;
  auth: AuthConfig;
  jupyter: JupyterConfig;
  google: GoogleConfig;
  mail: MailConfig;
};