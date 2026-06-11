import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from '@sandworm/graphql';
import {
  AsyncContextProvider,
  Environment,
  FastifyPinoLogger,
  REQUEST_ID_HEADER,
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
import { EventEmitterModule } from '@nestjs/event-emitter';
import { jupyterConfig } from '@sandworm/jupyter';
import { LoggerModule } from 'nestjs-pino';
import { AppService } from './app.service';
import { AllConfigType } from './core/config/config.type';
import { TypeOrmConfigService } from './infrastructure/database/typeorm-config.service';
import { RedisModule } from './infrastructure/redis/redis.module';
import googleConfig from './features/auth/google/config/google.config';
import mailConfig from './infrastructure/mail/config/mail.config';
import authConfig from './features/auth/core/config/auth.config';
import { ApiModule } from './api.module';
import { WebsocketModule } from './infrastructure/websocket/websocket.module';
import openrouterConfig from './infrastructure/openrouter/config/openrouter.config';

const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [
    appConfig,
    databaseConfig,
    authConfig,
    jupyterConfig,
    googleConfig,
    mailConfig,
    openrouterConfig,
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
      logging: isLocal || isDevelopment,
    };
  },
  inject: [ConfigService],
});

const graphqlModule = GraphQLModule.forRootAsync<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  useFactory: async (configService: ConfigService<AllConfigType>) => {
    const env = configService.get('app.nodeEnv', { infer: true });
    const isLocal: boolean = env === Environment.LOCAL;
    const isDevelopment: boolean = env === Environment.DEVELOPMENT;
    return {
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      introspection: true,
      path: '/api/graphql',
      graphiql: isLocal || isDevelopment,
      context: (request, reply) => ({ req: request, reply }),
    };
  },
  inject: [ConfigService],
});

const eventEmitterModule = EventEmitterModule.forRoot({
  wildcard: false,
  delimiter: '.',
  newListener: false,
  removeListener: false,
  maxListeners: 10,
  verboseMemoryLeak: false,
  ignoreErrors: false,
});

const loggerModule = LoggerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService<AllConfigType>) => {
    const env = config.getOrThrow('app.nodeEnv', { infer: true });
    const isLocal = env === Environment.LOCAL;
    const isDev = env === Environment.DEVELOPMENT;
    const shouldPushToLogdy = isLocal || isDev;

    return {
      pinoHttp: {
        level:
          process.env.LOG_LEVEL ?? (shouldPushToLogdy ? 'debug' : 'info'),
        genReqId: (req) =>
          (req.headers[REQUEST_ID_HEADER] as string) ?? undefined,
        customProps: (req) => ({ reqId: req.id }),
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.headers["x-api-key"]',
            '*.password',
            '*.token',
            '*.secret',
          ],
          remove: true,
        },
        autoLogging: {
          ignore: (req) => req.url === '/health' || req.url === '/metrics',
        },
        customLogLevel: (req, res, err) => {
          if (res.statusCode >= 500 || err) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
        transport: shouldPushToLogdy
          ? {
            targets: [
              {
                target: 'pino/file',
                level: 'debug',
                options: { destination: 1 },
              },
              {
                target: 'pino-socket',
                level: 'debug',
                options: {
                  address: process.env.LOGDY_HOST ?? 'localhost',
                  port: Number(process.env.LOGDY_PORT ?? 10800),
                  mode: 'tcp',
                  reconnect: true,
                  reconnectTries: 3,
                },
              },
            ],
          }
          : undefined,
      },
    };
  },
});

@Module({
  imports: [
    configModule,
    dbModule,
    i18nModule,
    RedisModule,
    WebsocketModule,
    ApiModule,
    eventEmitterModule,
    graphqlModule,
    loggerModule,
  ],
  providers: [AppService, AsyncContextProvider, FastifyPinoLogger],
  exports: [AsyncContextProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}