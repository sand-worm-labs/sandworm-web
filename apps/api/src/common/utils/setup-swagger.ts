import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllConfigType } from '@/';

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService<AllConfigType>,
): void {
  const logger = new Logger('Swagger');
  const swaggerConfig = configService.get('app.swagger', { infer: true });

  if (!swaggerConfig?.enabled) {
    logger.warn('Swagger documentation is disabled');
    return;
  }

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
      configService.get('app.url', { infer: true }) || 'http://localhost:8003',
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