import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
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
import { AuthGuard } from './core/guards/auth.guard';
import { setupSwagger } from './common/utils/setup-swagger';
import { AuthService } from './features/auth/core/auth.service';
import { YjsGateway } from './features/collaboration/yjs/yjs.gateway';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter({
    requestIdHeader: REQUEST_ID_HEADER,
    genReqId: genReqId(),
    logger: fastifyPinoOptions(process.env.NODE_ENV as FastifyLoggerEnv),
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
    exclude: ['graphiql', 'graphiql/(.*)'],
  });

  // ⬢ Guards, filters, pipes
  app.useGlobalGuards(new AuthGuard(reflector, app.get(AuthService)));
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