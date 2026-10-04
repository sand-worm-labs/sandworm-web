import { createAuthenticator } from './auth.ts';
import { loadConfig } from './config.ts';
import { createHttpServer } from './server.ts';

const config = loadConfig();

const deps = {
  authenticate: createAuthenticator(config),
  publicUrl: config.publicUrl,
  authServerUrl: config.authServerUrl,
  apiUrl: config.apiUrl,
  webUrl: config.webUrl,
  logToolCalls: config.logToolCalls,
};

createHttpServer(deps).listen(config.port, () => {
  console.log(`Sandworm MCP listening on http://localhost:${config.port}/mcp (OAuth via ${config.authServerUrl})`);
});
