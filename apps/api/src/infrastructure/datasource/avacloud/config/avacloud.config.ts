import { registerAs } from '@nestjs/config';
import { AvacloudConfig } from './avacloud-config.type';

// Optional, like etherscan.config.ts: the Avalanche Metrics and Data APIs work
// without a key, so leaving it unset must not crash the API at boot. When set,
// it is exported to every notebook kernel as AVACLOUD_API_KEY (see
// jupyter-session.service.ts) so all users get the free-tier limits of this key
// instead of sharing the unauthenticated per-IP pool.
export default registerAs<AvacloudConfig>('avacloud', () => ({
  apiKey: process.env.AVACLOUD_API_KEY || null,
}));
