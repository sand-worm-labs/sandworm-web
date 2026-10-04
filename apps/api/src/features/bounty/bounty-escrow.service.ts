import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BountyEntity } from '@sandworm/postgresql-typeorm';
import { bountyEscrowAbi, bountyRef, escrowAddressFor, escrowTokens } from '@sandworm/types/escrow';
import { Repository } from 'typeorm';
import { createPublicClient, formatUnits, http, parseEventLogs, type Chain, type Hash } from 'viem';
import { arbitrum, arbitrumSepolia, robinhood, robinhoodTestnet } from 'viem/chains';
import { Bounty } from './bounty.model';

const CHAINS = [robinhoodTestnet, robinhood, arbitrumSepolia, arbitrum];

const makeClient = (chain: Chain, url?: string) => createPublicClient({ chain, transport: http(url) });

const formatAmount = (amount: string) =>
  Number(amount).toLocaleString('en-US', { maximumFractionDigits: 6 });

@Injectable()
export class BountyEscrowService {
  private readonly clients = new Map<number, ReturnType<typeof makeClient>>();

  constructor(
    @InjectRepository(BountyEntity)
    private readonly bountyRepository: Repository<BountyEntity>,
  ) { }

  private clientFor(chainId: number) {
    const cached = this.clients.get(chainId);
    if (cached) return cached;
    const chain = CHAINS.find(c => c.id === chainId);
    if (!chain) throw new BadRequestException('This network is not supported');
    const client = makeClient(chain, process.env[`ESCROW_RPC_${chainId}`]);
    this.clients.set(chainId, client);
    return client;
  }

  async confirmFunding(slug: string, chainId: number, txHash: string, userId: string): Promise<Bounty> {
    const entity = await this.bountyRepository.findOneBy({ slug });
    if (!entity || entity.creatorId !== userId) throw new NotFoundException('Bounty not found');
    if (entity.onchainId) {
      if (entity.fundTxHash?.toLowerCase() === txHash.toLowerCase()) return Bounty.fromEntity(entity);
      throw new BadRequestException('This bounty is already funded');
    }

    const escrow = escrowAddressFor(chainId);
    if (!escrow) throw new BadRequestException('There is no escrow on this network');

    let receipt: Awaited<ReturnType<ReturnType<typeof makeClient>['getTransactionReceipt']>>;
    try {
      receipt = await this.clientFor(chainId).getTransactionReceipt({ hash: txHash as Hash });
    } catch {
      throw new BadRequestException('Transaction not found yet. Try again in a moment.');
    }
    if (receipt.status !== 'success') throw new BadRequestException('The transaction failed');

    const expectedRef = bountyRef(slug);
    const created = parseEventLogs({ abi: bountyEscrowAbi, eventName: 'BountyCreated', logs: receipt.logs })
      .filter(log => log.address.toLowerCase() === escrow.toLowerCase())
      .map(log => log.args)
      .find(args => args.ref === expectedRef);
    if (!created) throw new BadRequestException('No funding for this bounty was found in that transaction');

    const token = escrowTokens[chainId]?.find(t => t.address.toLowerCase() === created.token.toLowerCase());
    if (!token) throw new BadRequestException('This token is not supported');

    const amount = formatUnits(created.amount, token.decimals);
    Object.assign(entity, {
      status: 'open',
      chainId,
      onchainId: created.id.toString(),
      sponsorAddress: created.sponsor,
      fundTxHash: txHash,
      rewardToken: token.symbol,
      rewardAmount: amount,
      reward: `${formatAmount(amount)} ${token.symbol}`,
      deadline: new Date(Number(created.deadline) * 1000),
    });
    return Bounty.fromEntity(await this.bountyRepository.save(entity));
  }
}
