import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from '@sandworm/graphql';
import {
  AsyncContextProvider,
  Environment,
  FastifyPinoLogger,
  RequestIdMiddleware,
} from '@sandworm/nest-common';
import { databaseConfig } from '@sandworm/postgresql-typeorm';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import path, { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
// import { AppResolver } from './app.resolver';
import { jupyterConfig } from '@sandworm/jupyter';
import { AppService } from './app.service';
import { AllConfigType } from './config/config.type';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { ApiModule } from './modules/api.module';
import googleConfig from './modules/auth-google/config/google.config';
import authConfig from './modules/auth/config/auth.config';
import mailConfig from './modules/mail/config/mail.config';

const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [
    appConfig,
    databaseConfig,
    authConfig,
    jupyterConfig,
    googleConfig,
    mailConfig,
  ],
  envFilePath: ['.env'],
});

const dbModule = TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
  dataSourceFactory: async (options: DataSourceOptions) => {
    if (!options) {
      throw new Error('Invalid options passed');
    }

    return new DataSource(options).initialize();
  },
});

const i18nModule = I18nModule.forRootAsync({
  resolvers: [
    { use: QueryResolver, options: ['lang'] },
    AcceptLanguageResolver,
    new HeaderResolver(['x-lang']),
  ],
  useFactory: (configService: ConfigService<AllConfigType>) => {
    const env = configService.get('app.nodeEnv', { infer: true });
    const isLocal = env === Environment.LOCAL;
    const isDevelopment = env === Environment.DEVELOPMENT;
    return {
      fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
        infer: true,
      }),
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: isLocal,
      },
      typesOutputPath: path.join(
        __dirname,
        '../src/generated/i18n.generated.ts',
      ),
      logging: isLocal || isDevelopment, // log info on missing keys
    };
  },
  inject: [ConfigService],
});

const graphqlModule = GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  useFactory: async (configService: ConfigService<AllConfigType>) => {
    const env = configService.get('app.nodeEnv', { infer: true });
    const isLocal: boolean = env === Environment.LOCAL;
    const isDevelopment: boolean = env === Environment.DEVELOPMENT;

    return {
      debug: isLocal || isDevelopment,
      includeStacktraceInErrorResponses: isLocal || isDevelopment,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,

      // ✅ Enable introspection
      introspection: true,

      // ✅ Enable classic playground (more reliable)
      playground:
        isLocal || isDevelopment
          ? {
              settings: {
                'request.credentials': 'include',
              },
            }
          : false,

      context: ({ req, res }) => ({ req, res }),
    };
  },
  inject: [ConfigService],
});

@Module({
  imports: [configModule, dbModule, i18nModule, ApiModule, graphqlModule],
  providers: [
    AppService,
    AsyncContextProvider,
    FastifyPinoLogger,
    // {
    //   provide: APP_FILTER,
    //   useClass: GlobalGqlExceptionFilter,
    // },
  ],
  exports: [AsyncContextProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
