import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { AllConfigType } from './config/config.type';
import { ApiModule } from './modules/api.module';
import authConfig from './modules/auth/config/auth.config';
import { BaseContext } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { appConfig } from '@sandworm/graphql';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { JupyterModule } from './jupyter/jupyter.module';

const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [appConfig, databaseConfig, authConfig],
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
    return {
      nodeEnv: env,
      debug: isLocal,
      includeStacktraceInErrorResponses: isLocal,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      introspection: isLocal,
      playground: false,
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({
          embed: isLocal ? true : undefined,
        }),
      ] as BaseContext[],
      context: ({ req, res }) => ({ req, res }),
    };
  },
  inject: [ConfigService],
});

@Module({
  imports: [configModule, dbModule, i18nModule, ApiModule, graphqlModule, JupyterModule],
  providers: [AppService, AsyncContextProvider, FastifyPinoLogger, AppResolver],
  exports: [AsyncContextProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
