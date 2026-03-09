import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
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
import { IoAdapter } from '@nestjs/platform-socket.io';
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
import { AuthGraphqlService } from './features/auth/graphql/auth-graphql.service';
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

  const configService = app.get(ConfigService<AllConfigType>);
  const reflector = app.get(Reflector);
  const httpAdapterHost = app.get(HttpAdapterHost);
  const asyncContext = app.get(AsyncContextProvider);

  const env = configService.getOrThrow('app.nodeEnv', { infer: true });
  const isProduction = env === Environment.PRODUCTION;
  const debug = env === Environment.LOCAL || env === Environment.DEVELOPMENT;

  const logger = new ConsoleLogger({
    ...(env === Environment.LOCAL && { colors: true }),
    ...(env !== Environment.LOCAL && { json: true }),
  });
  app.useLogger(logger);

  fastifyAdapter.getInstance().addHook('onRequest', (request, _reply, done) => {
    asyncContext.run(() => {
      asyncContext.set('log', request.log);
      done();
    }, new Map());
  });

  fastifyAdapter.getInstance().addContentTypeParser(
    ['application/octet-stream'],
    { parseAs: 'buffer' },
    (_req, body, done) => done(null, body),
  );


  app.register(helmet, {
    contentSecurityPolicy: isProduction ? undefined : false,
  });

  app.register(compression);

  await app.register(cookie);
  
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
    origin: isProduction ? origins : true, // Allow all origins in non-production for WebSocket testing
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

  app.useGlobalGuards(new AuthGuard(reflector, app.get(AuthGraphqlService)));

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

  const swaggerConfig = configService.get('app.swagger', {
    infer: true,
  });

  if (swaggerConfig?.enabled && !isProduction) {
    setupSwagger(app, configService);
  }


  const port = configService.getOrThrow('app.port', {
    infer: true,
  }) as number;


  app.useWebSocketAdapter(new IoAdapter(app));

  // 2. Initialize app (starts Socket.IO)
  await app.init();
  const yjsGateway = app.get(YjsGateway);
  yjsGateway.init(port);


  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Server running at http://0.0.0.0:${port}`);
  logger.log(`📊 GraphQL Playground http://0.0.0.0:${port}/graphql`);
  logger.log(`🔌 WebSocket endpoint ws://0.0.0.0:${port}/socket.io/`);
  logger.log(`📝 Environment: ${env}`);

}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});