import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { keccak256 } from 'js-sha3';
import { AllConfigType } from '@/core/config/config.type';
import { ContractAbi, ContractEvent, ContractFunction } from './contract-abi.model';

// Etherscan V2's unified API — one key, one host, `chainid` picks the network.
// Same 8 chains every power tool's "chain" param already offers
// (see packages/editor/src/blocks/powertool/constants.ts).
const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  base: 8453,
  optimism: 10,
  arbitrum: 42161,
  polygon: 137,
  bsc: 56,
  avalanche: 43114,
  celo: 42220,
  gnosis: 100,
  fantom: 250,
  linea: 59144,
  scroll: 534352,
  blast: 81457,
  zksync: 324,
};

interface AbiParam {
  name: string;
  type: string;
  components?: AbiParam[];
}

interface AbiEntry {
  type: string;
  name?: string;
  inputs?: AbiParam[];
}

@Injectable()
export class ContractAbiService {
  private readonly logger = new Logger(ContractAbiService.name);

  constructor(private readonly config: ConfigService<AllConfigType>) { }

  async getContractAbi(chain: string, address: string): Promise<ContractAbi> {
    const chainId = CHAIN_IDS[chain];
    if (!chainId) {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    const apiKey = this.config.get('etherscan.apiKey', { infer: true });
    if (!apiKey) {
      throw new Error('ETHERSCAN_API_KEY is not configured on this server.');
    }

    const { data } = await axios.get('https://api.etherscan.io/v2/api', {
      params: {
        chainid: chainId,
        module: 'contract',
        action: 'getabi',
        address,
        apikey: apiKey,
      },
      timeout: 15_000,
    });

    if (data.status !== '1') {
      throw new Error(
        `Could not fetch ABI for ${address} on ${chain}: ${data.result}. The contract may be unverified on the block explorer.`,
      );
    }

    const abi = JSON.parse(data.result) as AbiEntry[];

    const functions: ContractFunction[] = abi
      .filter((entry) => entry.type === 'function' && entry.name)
      .map((entry) => {
        const signature = toCanonicalSignature(entry);
        return {
          name: entry.name!,
          signature,
          selector: keccak256(signature).slice(0, 8),
        };
      });

    const events: ContractEvent[] = abi
      .filter((entry) => entry.type === 'event' && entry.name)
      .map((entry) => {
        const signature = toCanonicalSignature(entry);
        return {
          name: entry.name!,
          signature,
          topic0: keccak256(signature),
        };
      });

    return { functions, events };
  }
}

// Builds "name(type1,type2,...)" from an ABI entry's inputs, recursing into
// tuple components — the same canonical form Solidity uses to derive a
// selector/topic0, so viem's hash functions need nothing more than this string.
function toCanonicalSignature(entry: AbiEntry): string {
  const paramType = (param: AbiParam): string =>
    param.type.startsWith('tuple')
      ? `(${(param.components ?? []).map(paramType).join(',')})${param.type.slice('tuple'.length)}`
      : param.type;

  return `${entry.name}(${(entry.inputs ?? []).map(paramType).join(',')})`;
}
