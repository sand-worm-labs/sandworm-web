import { AppConfig } from '@sandworm/graphql';
import { DatabaseConfig } from '@sandworm/postgresql-typeorm';
import { AuthConfig } from 'src/modules/auth/config/auth-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
};
