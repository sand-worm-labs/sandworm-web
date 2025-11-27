import { AppConfig } from '@sandworm/graphql';
import { DatabaseConfig } from '@sandworm/postgresql-typeorm';
import {JupyterConfig} from "@sandworm/jupyter";
import { AuthConfig } from 'src/modules/auth/config/auth-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
  jupyter: JupyterConfig;
};
