import { AppConfig } from '@sandworm/graphql';
import { DatabaseConfig } from '@sandworm/postgresql-typeorm';
import {JupyterConfig} from "@sandworm/jupyter";
import { AuthConfig } from '@/api/auth/config/auth-config.type';
import { GoogleConfig } from '@/api/auth-google/config/google-config.type';
import { MailConfig } from '@/api/mail/config/mail-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
  jupyter: JupyterConfig;
  google: GoogleConfig;
  mail: MailConfig;
};


// import { AppConfig } from './app-config.type';
// import { AppleConfig } from '../auth-apple/config/apple-config.type';
// import { AuthConfig } from '../auth/config/auth-config.type';
// import { DatabaseConfig } from '../database/config/database-config.type';
// import { FacebookConfig } from '../auth-facebook/config/facebook-config.type';
// import { FileConfig } from '../files/config/file-config.type';
// import { GoogleConfig } from '../auth-google/config/google-config.type';
// import { MailConfig } from '../mail/config/mail-config.type';

// export type AllConfigType = {
//   app: AppConfig;
//   apple: AppleConfig;
//   auth: AuthConfig;
//   database: DatabaseConfig;
//   facebook: FacebookConfig;
//   file: FileConfig;
//   google: GoogleConfig;
//   mail: MailConfig;
// };
