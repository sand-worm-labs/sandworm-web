import { loadConfig } from './config.ts';
import { createCharge } from './payments.ts';
import { createHttpServer } from './server.ts';
import { runTrinoQuery } from './trino.ts';

const config = loadConfig();

const deps = {
  charge: createCharge(config),
  query: (sql: string) => runTrinoQuery(config.trino, sql, { maxRows: config.maxRows, timeoutMs: config.timeoutMs }),
};

// Base units -> dollars for the tool description (USDC has 6 decimals).
const display = `${(Number(config.price) / 1_000_000).toFixed(6).replace(/0+$/, '').replace(/\.$/, '')} USDC`;

createHttpServer(deps, { display }).listen(config.port, () => {
  console.log(`Sandworm MCP listening on http://localhost:${config.port}/mcp (${config.network}, ${display} per query)`);
});
