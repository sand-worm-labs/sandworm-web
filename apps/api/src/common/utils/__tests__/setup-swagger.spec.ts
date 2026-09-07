// DocumentBuilder/SwaggerModule pull in the full swagger-ui asset pipeline —
// stub them so the test only exercises setupSwagger's own branching logic.
jest.mock('@nestjs/swagger', () => {
  const builder: any = {};
  ['setTitle', 'setDescription', 'setVersion', 'addTag', 'addBearerAuth', 'addServer'].forEach(
    (method) => {
      builder[method] = jest.fn(() => builder);
    },
  );
  builder.build = jest.fn(() => ({ built: true }));

  return {
    DocumentBuilder: jest.fn(() => builder),
    SwaggerModule: {
      createDocument: jest.fn(() => ({ document: true })),
      setup: jest.fn(),
    },
    __builder: builder,
  };
});

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setupSwagger } from '../setup-swagger';

function makeConfigService(overrides: Record<string, any> = {}) {
  const values: Record<string, any> = {
    'app.swagger': {
      enabled: true,
      title: 'My API',
      description: 'desc',
      version: '1.0',
      path: 'docs',
    },
    'app.url': 'https://api.example.com',
    'app.port': 8003,
    ...overrides,
  };

  return { get: jest.fn((key: string) => values[key]) } as any;
}

describe('setupSwagger', () => {
  const app = {} as any;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does nothing when swagger is disabled', () => {
    const configService = makeConfigService({ 'app.swagger': { enabled: false } });

    setupSwagger(app, configService);

    expect(SwaggerModule.createDocument).not.toHaveBeenCalled();
    expect(SwaggerModule.setup).not.toHaveBeenCalled();
  });

  it('does nothing when swagger config is missing entirely', () => {
    const configService = makeConfigService({ 'app.swagger': undefined });

    setupSwagger(app, configService);

    expect(SwaggerModule.createDocument).not.toHaveBeenCalled();
  });

  it('builds and mounts the swagger document when enabled', () => {
    const configService = makeConfigService();

    setupSwagger(app, configService);

    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(app, { built: true });
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'docs',
      app,
      { document: true },
      expect.objectContaining({ customSiteTitle: 'My API' }),
    );
  });

  it('falls back to the default local URL when app.url is not configured', () => {
    const configService = makeConfigService({ 'app.url': undefined });
    const builder = (DocumentBuilder as unknown as jest.Mock)();

    setupSwagger(app, configService);

    expect(builder.addServer).toHaveBeenCalledWith('http://localhost:8003', 'Local Development');
  });
});
