import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import {
  AsyncContextProvider,
  Environment,
  FastifyLoggerEnv,
  fastifyPinoOptions,
  genReqId,
  REQUEST_ID_HEADER,
} from '@sandworm/nest-common';
import {
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
import { AppModule } from './app.module';
import { AllConfigType } from './config/config.type';
import { GlobalGqlExceptionFilter } from './filters/global-gql-exception.filter';
import { AuthGuard } from './guards/auth.guard';
import { AuthGraphqlService } from './modules/auth-graphql/auth.service';

import { ConsoleLogger } from '@nestjs/common';

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

  // Configure the logger
  const asyncContext = app.get(AsyncContextProvider);

  const logger = new ConsoleLogger({
    ...(configService.getOrThrow('app.nodeEnv', { infer: true }) ===
      Environment.LOCAL && {
      colors: true,
    }),
    ...(configService.getOrThrow('app.nodeEnv', { infer: true }) !==
      Environment.LOCAL && {
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

  // ✅ Updated CSP Configuration - Allow GraphQL Playground CDN
  const env = configService.getOrThrow('app.nodeEnv', { infer: true });
  const isProduction = env === Environment.PRODUCTION;

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
        "'unsafe-eval'",  // ✅ Required for GraphQL Playground
        'https://unpkg.com',
        'https://embeddable-sandbox.cdn.apollographql.com',
        'https://apollo-server-landing-page.cdn.apollographql.com',
        'http://cdn.jsdelivr.net',   // ✅ Add this
        'https://cdn.jsdelivr.net',  // ✅ Add this
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://unpkg.com',
        'https://fonts.googleapis.com',
        'http://cdn.jsdelivr.net',   // ✅ Add this
        'https://cdn.jsdelivr.net',  // ✅ Add this
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https:',  // ✅ Allow all HTTPS images
        'http:',   // ✅ Allow all HTTP images (for development)
        'https://apollo-server-landing-page.cdn.apollographql.com',
      ],
      fontSrc: [  // ✅ Add font sources
        "'self'",
        'https://fonts.gstatic.com',
        'https://fonts.googleapis.com',
        'http://cdn.jsdelivr.net',
        'https://cdn.jsdelivr.net',
      ],
      connectSrc: [  // ✅ Add connect sources
        "'self'",
        'https://sandbox.embed.apollographql.com',
      ],
    },
  };

  app.register(helmet, {
    contentSecurityPolicy: isProduction ? undefined : devContentSecurityPolicy,
  });

  // For high-traffic websites in production, it is strongly recommended to offload compression from the application server - typically in a reverse proxy (e.g., Nginx). In that case, you should not use compression middleware.
  app.register(compression);

  // ✅ Enhanced CORS Configuration
  const corsOrigin = configService.getOrThrow('app.corsOrigin', {
    infer: true,
  });

  // Parse CORS origins
  const origins = typeof corsOrigin === 'string' 
    ? corsOrigin.split(',').map(o => o.trim())
    : corsOrigin;

  app.enableCors({
    origin: isProduction ? origins : true,  // ✅ Allow all in development
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',  // ✅ Allow all headers in development
    credentials: true,
  });

  logger.log(`CORS Origin: ${isProduction ? corsOrigin.toString() : 'All origins (development)'}`);

  app.useGlobalGuards(new AuthGuard(reflector, app.get(AuthGraphqlService)));

  app.useGlobalFilters(new GlobalGqlExceptionFilter());

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

  const port = configService.getOrThrow('app.port', { infer: true }) as number;
  await app.listen(port, '0.0.0.0');

  // ✅ Add helpful startup logs
  logger.log(`🚀 Server running at: http://localhost:${port}`);
  logger.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
  logger.log(`📖 REST API: http://localhost:${port}/auth`);
}

bootstrap();