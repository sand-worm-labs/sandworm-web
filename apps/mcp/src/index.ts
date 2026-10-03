import { createAuthenticator } from './auth.ts';
import { loadConfig } from './config.ts';
import { createCharge } from './payments.ts';
import { createHttpServer } from './server.ts';

const config = loadConfig();

const deps = {
  charge: createCharge(config),
  authenticate: createAuthenticator(config),
  publicUrl: config.publicUrl,
  authServerUrl: config.authServerUrl,
  apiUrl: config.apiUrl,
  webUrl: config.webUrl,
  logToolCalls: config.logToolCalls,
};

// Base units -> dollars for the tool description (USDC has 6 decimals).
const display = `${(Number(config.price) / 1_000_000).toFixed(6).replace(/0+$/, '').replace(/\.$/, '')} USDC`;

createHttpServer(deps, { display }).listen(config.port, () => {
  console.log(`Sandworm MCP listening on http://localhost:${config.port}/mcp (${config.network}, ${display} per call, OAuth via ${config.authServerUrl})`);
});
