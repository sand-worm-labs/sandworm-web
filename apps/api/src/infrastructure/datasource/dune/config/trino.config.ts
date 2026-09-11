import { registerAs } from '@nestjs/config';
import { TrinoConfig } from './trino-config.type';

// No strict validation here on purpose — this is a Dune data source,
// not core app config. Leaving TRINO_* unset must not crash the API
// at boot; an unconfigured connection should just fail (visibly, in
// the block's result) the moment someone actually runs a query against it.
export default registerAs<TrinoConfig>('trino', () => {
  const port = process.env.TRINO_PORT ? parseInt(process.env.TRINO_PORT, 10) : 443;

  return {
    host:     process.env.TRINO_HOST ?? '',
    port,
    catalog:  process.env.TRINO_CATALOG ?? '',
    schema:   process.env.TRINO_SCHEMA || null,
    user:     process.env.TRINO_USER ?? '',
    password: process.env.TRINO_PASSWORD ?? null,
    // Defaults to https on 443 (Dune's endpoint requires TLS), http elsewhere.
    httpScheme: (process.env.TRINO_HTTP_SCHEME as 'http' | 'https') || (port === 443 ? 'https' : 'http'),
  };
});
