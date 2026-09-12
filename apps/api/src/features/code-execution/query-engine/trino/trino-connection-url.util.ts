import { TrinoConfig } from '@/infrastructure/datasource/dune/config/trino-config.type';

export function buildTrinoConnectionUrl(config: TrinoConfig): string {
  const { host, port, catalog, schema, user, password, httpScheme } = config;
  const auth = password
    ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}`
    : encodeURIComponent(user);
  const path = schema ? `${catalog}/${schema}` : catalog;
  return `trino://${auth}@${host}:${port}/${path}?http_scheme=${httpScheme}`;
}
