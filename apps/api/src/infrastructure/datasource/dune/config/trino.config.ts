import { registerAs } from '@nestjs/config';
import { TrinoConfig } from './trino-config.type';

// No strict validation here on purpose — this is a Dune data source,
// not core app config. Leaving TRINO_* unset must not crash the API
// at boot; an unconfigured connection should just fail (visibly, in
// the block's result) the moment someone actually runs a query against it.
export default registerAs<TrinoConfig>('trino', () => ({
  host:     process.env.TRINO_HOST ?? '',
  port:     process.env.TRINO_PORT ? parseInt(process.env.TRINO_PORT, 10) : 443,
  catalog:  process.env.TRINO_CATALOG ?? '',
  user:     process.env.TRINO_USER ?? '',
  password: process.env.TRINO_PASSWORD ?? null,
}));
