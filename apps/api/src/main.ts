// apps/api/src/main.ts

import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import {
  ConsoleLogger,
  HttpStatus,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  AsyncContextProvider,
  Environment,
  FastifyLoggerEnv,
  fastifyPinoOptions,
  genReqId,
  REQUEST_ID_HEADER,
} from '@sandworm/nest-common';
import { AppModule } from './app.module';
import { AllConfigType } from './config/config.type';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter({
    requestIdHeader: REQUEST_ID_HEADER,
    genReqId: genReqId(),
    logger: fastifyPinoOptions(process.env.NODE_ENV as FastifyLoggerEnv),
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      bufferLogs: true,
    },
  );

  // Get services
  const configService = app.get(ConfigService<AllConfigType>);
  const reflector = app.get(Reflector);

  // ✅ Get environment early to use throughout
  const env = configService.getOrThrow('app.nodeEnv', { infer: true });
  const isProduction = env === Environment.PRODUCTION;

  // Configure the logger
  const asyncContext = app.get(AsyncContextProvider);

  const logger = new ConsoleLogger({
    ...(env === Environment.LOCAL && {
      colors: true,
    }),
    ...(env !== Environment.LOCAL && {
      json: true,
    }),
  });

  app.useLogger(logger);

  fastifyAdapter.getInstance().addHook('onRequest', (request, reply, done) => {
    asyncContext.run(() => {
      asyncContext.set('log', request.log);
      done();
    }, new Map());
  });

  const devContentSecurityPolicy = {
    directives: {
      defaultSrc: [
        "'self'",
        'https://sandbox.embed.apollographql.com',
        'https://apollo-server-landing-page.cdn.apollographql.com',
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://unpkg.com',
        'https://embeddable-sandbox.cdn.apollographql.com',
        'https://apollo-server-landing-page.cdn.apollographql.com',
        'http://cdn.jsdelivr.net',
        'https://cdn.jsdelivr.net',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://unpkg.com',
        'https://fonts.googleapis.com',
        'http://cdn.jsdelivr.net',
        'https://cdn.jsdelivr.net',
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https:',
        'http:',
        'https://apollo-server-landing-page.cdn.apollographql.com',
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'https://fonts.googleapis.com',
        'http://cdn.jsdelivr.net',
        'https://cdn.jsdelivr.net',
      ],
      connectSrc: ["'self'", 'https://sandbox.embed.apollographql.com'],
    },
  };

  app.register(helmet, {
    contentSecurityPolicy: isProduction ? undefined : devContentSecurityPolicy,
  });

  app.register(compression);

  const corsOrigin = configService.getOrThrow('app.corsOrigin', {
    infer: true,
  });

  const origins =
    typeof corsOrigin === 'string'
      ? corsOrigin.split(',').map((o) => o.trim())
      : Array.isArray(corsOrigin)
        ? corsOrigin
        : [corsOrigin];

  app.enableCors({
    origin: isProduction ? origins : 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  logger.log(
    `CORS Origin: ${isProduction ? origins.join(', ') : 'All origins (development)'}`,
  );

  // Global guards, filters, and pipes
  // app.useGlobalGuards(new AuthGuard(reflector, app.get(AuthGraphqlService)));
  ///app.useGlobalFilters(new GlobalGqlExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) => {
        return new UnprocessableEntityException(errors);
      },
    }),
  );

  const swaggerConfig = configService.get('app.swagger', { infer: true });

  if (swaggerConfig?.enabled && !isProduction) {
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addTag('Auth', 'Authentication and authorization endpoints')
      .addTag('Google OAuth', 'Google OAuth authentication')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addServer(
        configService.get('app.url', { infer: true }) ||
          'http://localhost:8003',
        'Local Development',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(swaggerConfig.path, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
      customSiteTitle: swaggerConfig.title,
    });

    const port = configService.get('app.port', { infer: true });
    logger.log(
      `📚 Swagger Documentation: http://localhost:${port}/${swaggerConfig.path}`,
    );
  }

  // Start server
  const port = configService.getOrThrow('app.port', { infer: true }) as number;
  await app.listen(port, '0.0.0.0');

  // ✅ Startup logs
  logger.log(`🚀 Server running at: http://localhost:${port}`);
  logger.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
  logger.log(`📖 REST API: http://localhost:${port}/auth`);

  if (swaggerConfig?.enabled && !isProduction) {
    logger.log(`📚 API Docs: http://localhost:${port}/${swaggerConfig.path}`);
  }
}

bootstrap();
