import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { rateLimitKey, rateLimitMax } from './core/rate-limit';
import {
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
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger as PinoLogger } from 'nestjs-pino';
import {
  AsyncContextProvider,
  Environment,
  FastifyLoggerEnv,
  fastifyPinoOptions,
  genReqId,
  REQUEST_ID_HEADER,
} from '@sandworm/nest-common';
import { AppModule } from './app.module';
import { AllConfigType } from './core/config/config.type';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { AuditService } from '@/features/audit/audit.service';
import { DataSource } from 'typeorm';
import { DocumentEntity, UserWorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { AuthGuard } from './core/guards/auth.guard';
import { WorkspaceAccessGuard } from './core/guards/workspace-access.guard';
import { setupSwagger } from './common/utils/setup-swagger';
import { AuthService } from './features/auth/core/auth.service';
import { YjsGateway } from './features/collaboration/yjs/yjs.gateway';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter({
    requestIdHeader: REQUEST_ID_HEADER,
    genReqId: genReqId(),
    logger: fastifyPinoOptions(process.env.NODE_ENV as FastifyLoggerEnv),
    // Fastify's default is 1MB, which the workspace file-upload endpoint
    // (raw octet-stream body) blows past for anything but a tiny file.
    bodyLimit: 20 * 1024 * 1024, // 20MB
    // Caddy (in Docker) and local services sit in front of the API. Trusting
    // only loopback and private ranges gives the real client IP for rate
    // limits and audit logs, without letting public callers spoof it.
    trustProxy: 'loopback,uniquelocal',
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    { bufferLogs: true },
  );

  app.useLogger(app.get(PinoLogger));

  const configService = app.get(ConfigService<AllConfigType>);
  const reflector = app.get(Reflector);
  const httpAdapterHost = app.get(HttpAdapterHost);
  const asyncContext = app.get(AsyncContextProvider);
  const logger = app.get(PinoLogger);

  const env = configService.getOrThrow('app.nodeEnv', { infer: true });
  const isProduction = env === Environment.PRODUCTION;
  const debug = env === Environment.LOCAL || env === Environment.DEVELOPMENT;

  // ⬢ Async context
  fastifyAdapter.getInstance().addHook('onRequest', (request, _reply, done) => {
    asyncContext.run(() => {
      asyncContext.set('log', request.log);
      done();
    }, new Map());
  });

  // ⬢ Binary content type
  fastifyAdapter.getInstance().addContentTypeParser(
    ['application/octet-stream'],
    { parseAs: 'buffer' },
    (_req, body, done) => done(null, body),
  );

  // ⬢ Security
  app.register(helmet, {
    contentSecurityPolicy: isProduction ? undefined : false,
  });
  app.register(compression);
  await app.register(cookie);
  // preHandler, so the GraphQL body is parsed and the login mutation can be
  // counted like the REST login route.
  await app.register(rateLimit, {
    global: true,
    hook: 'preHandler',
    timeWindow: '1 minute',
    max: (request) => rateLimitMax(request),
    keyGenerator: (request) => rateLimitKey(request),
  });

  // ⬢ CORS
  const corsOrigin = configService.getOrThrow('app.corsOrigin', { infer: true });
  const origins =
    typeof corsOrigin === 'string'
      ? corsOrigin.split(',').map((o) => o.trim())
      : Array.isArray(corsOrigin)
        ? corsOrigin
        : [corsOrigin];

  app.enableCors({
    origin: isProduction ? origins : true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-File-Name',
      'X-File-Size',
      'Cookie',
    ],
  });
  app.setGlobalPrefix('api', {
    // '.well-known/*' must stay unprefixed — RFC 8414 (OAuth Authorization
    // Server Metadata, used by apps/mcp's OAuth flow) requires it at a
    // fixed, discoverable path.
    exclude: ['graphiql', 'graphiql/(.*)', '.well-known/(.*)'],
  });

  // ⬢ Guards, filters, pipes
  const dataSource = app.get(DataSource);
  app.useGlobalGuards(
    new AuthGuard(reflector, app.get(AuthService), app.get(AuditService)),
    // Order matters: it reads the user AuthGuard attaches.
    new WorkspaceAccessGuard(
      reflector,
      dataSource.getRepository(UserWorkspaceEntity),
      dataSource.getRepository(DocumentEntity),
    ),
  );
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost, debug));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) =>
        new UnprocessableEntityException({
          message: errors,
          error: 'Unprocessable Entity',
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    }),
  );

  // ⬢ Swagger
  const swaggerConfig = configService.get('app.swagger', { infer: true });
  if (swaggerConfig?.enabled && !isProduction) {
    setupSwagger(app, configService);
  }

  const port = configService.getOrThrow('app.port', { infer: true }) as number;

  // ⬢ WebSocket adapters
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.init();
  const yjsGateway = app.get(YjsGateway);
  yjsGateway.init(port);

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Server running at http://0.0.0.0:${port}`);
  logger.log(`📊 GraphQL Playground http://0.0.0.0:${port}/api/graphiql`);
  logger.log(`🔌 WebSocket endpoint ws://0.0.0.0:${port}/socket.io/`);
  logger.log(`📝 Environment: ${env}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});