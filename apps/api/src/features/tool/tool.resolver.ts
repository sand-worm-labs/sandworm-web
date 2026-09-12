import { Args, Query, Resolver } from '@nestjs/graphql';
import { Public } from '@sandworm/nest-common';
import { ContractAbi } from './contract-abi.model';
import { ContractAbiService } from './contract-abi.service';
import { Tool } from './tool.model';
import { ToolCategory } from './tool-category.model';
import { ToolService } from './tool.service';

@Resolver(() => Tool)
export class ToolResolver {
  constructor(
    private readonly toolService: ToolService,
    private readonly contractAbiService: ContractAbiService,
  ) { }

  @Public()
  @Query(() => [Tool], {
    name: 'getTools',
    description: 'Get the full power tool catalog (SQL/Python analytics tools available to the notebook)',
  })
  getTools(): Promise<Tool[]> {
    return this.toolService.getTools();
  }

  @Public()
  @Query(() => [ToolCategory], {
    name: 'getToolCategories',
    description: 'Get the power tool category taxonomy',
  })
  getToolCategories(): Promise<ToolCategory[]> {
    return this.toolService.getToolCategories();
  }

  // Not @Public() — this proxies a rate-limited, API-keyed third-party
  // lookup (Etherscan), so it should only run for authenticated users.
  @Query(() => ContractAbi, {
    name: 'getContractAbi',
    description:
      'Fetch a verified contract\'s real function and event signatures from its block explorer ABI, for tool params that let a user pick one instead of guessing (e.g. calldata_decoder).',
  })
  getContractAbi(
    @Args('chain') chain: string,
    @Args('address') address: string,
  ): Promise<ContractAbi> {
    return this.contractAbiService.getContractAbi(chain, address);
  }
}
