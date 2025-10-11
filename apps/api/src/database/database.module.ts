import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { DatabaseAdapter } from "@sandworm/database"
import { DB_CONNECTION } from '../../constants';


@Module({
  providers: [
    {
      provide: DB_CONNECTION,
      inject: [ConfigService],
      useFactory: async () => {
        // const DATABASE_URL = configService.get<string>('DATABASE_URL');
        // const DATABASE_DRIVER = configService.get<'node' | 'neon'>('DATABASE_DRIVER');
        // const KEY_VAULTS_SECRET = configService.get<string>('KEY_VAULTS_SECRET');
        // const SERVICE_MODE = configService.get<string>('NEXT_PUBLIC_SERVICE_MODE');
        // const MIGRATION_DB = configService.get<string>('MIGRATION_DB');
        // return await DatabaseAdapter.getInstance()
      },
    },
  ],
  exports: [DB_CONNECTION],
})

export class DatabaseModule { }