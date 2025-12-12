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
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
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
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { AuthGuard } from './guards/auth.guard';
import { AuthGraphqlService } from './modules/auth-graphql/auth-graphql.service';
import { setupSwagger } from './utils/setup-swagger';

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
  const httpAdapterHost = app.get(HttpAdapterHost);

  // Get environment early to use throughout
  const env = configService.getOrThrow('app.nodeEnv', { infer: true });
  const isProduction = env === Environment.PRODUCTION;
  const debug = env === Environment.LOCAL || env === Environment.DEVELOPMENT;

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

  // Security headers
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

  // CORS
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
  app.useGlobalGuards(new AuthGuard(reflector, app.get(AuthGraphqlService)));
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost, debug));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) => {
        // Pass the full ValidationError objects instead of transforming them
        return new UnprocessableEntityException({
          message: errors, // Keep as ValidationError[]
          error: 'Unprocessable Entity',
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      },
    }),
  );

  // Setup Swagger (handles its own logging)
  const swaggerConfig = configService.get('app.swagger', { infer: true });
  if (swaggerConfig?.enabled && !isProduction) {
    setupSwagger(app, configService);
  }

  // Start server
  const port = configService.getOrThrow('app.port', { infer: true }) as number;
  await app.listen(port, '0.0.0.0');

  // Startup logs
  logger.log(`🚀 Server running at: http://localhost:${port}`);
  logger.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
  logger.log(`📖 REST API: http://localhost:${port}/auth`);
}

bootstrap();