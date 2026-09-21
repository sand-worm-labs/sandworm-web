import { registerAs } from '@nestjs/config';
import { EtherscanConfig } from './etherscan-config.type';

// No strict validation on purpose — same reasoning as trino.config.ts: this
// is an optional third-party lookup (ABI-based function selector resolution
// for the calldata_decoder power tool), not core app config. Leaving it
// unset must not crash the API at boot; a missing key should just fail
// (visibly, in the block's result) the moment someone runs that tool.
export default registerAs<EtherscanConfig>('etherscan', () => ({
  apiKey: process.env.ETHERSCAN_API_KEY || null,
}));
