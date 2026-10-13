import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { SEARCH_INDEX_STALE_EVENT } from '@/features/search/search.events';
import { BountyEntity, BountyEntryEntity } from '@sandworm/postgresql-typeorm';
import { bountyEscrowAbi, bountyRef, depositFor, escrowAddressFor, escrowTokens } from '@sandworm/types/escrow';
import { IsNull, Not, Repository } from 'typeorm';
import { createPublicClient, formatUnits, http, parseEventLogs, parseUnits, type Chain, type Hash } from 'viem';
import {  monad, monadTestnet } from 'viem/chains';
import { formatAmount } from './bounty.format';
import { buildWinners, type EntryByWallet, type PaidEvent } from './bounty-winners';
import { authorName, Bounty, ENTRY_RELATIONS, notebookSlug } from './bounty.model';

const CHAINS = [monadTestnet, monad];

const makeClient = (chain: Chain, url?: string) => createPublicClient({ chain, transport: http(url) });

@Injectable()
export class BountyEscrowService {
  private readonly clients = new Map<number, ReturnType<typeof makeClient>>();

  constructor(
    @InjectRepository(BountyEntity)
    private readonly bountyRepository: Repository<BountyEntity>,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(BountyEntryEntity)
    private readonly entryRepository: Repository<BountyEntryEntity>,
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

    // A bounty with a prize schedule is funded with exactly what pays every place in full, fee
    // included, at the fee the contract took for this bounty. Anything else was not agreed.
    const scheduled = (entity.prizeTiers ?? []).length > 0;
    if (scheduled) {
      const nets = entity.prizeTiers.map(tier => parseUnits(tier.amount, token.decimals));
      if (created.amount !== depositFor(nets, created.feeBps)) {
        throw new BadRequestException('The amount locked does not match the prize schedule');
      }
    }

    const amount = formatUnits(created.amount, token.decimals);
    Object.assign(entity, {
      status: 'open',
      chainId,
      onchainId: created.id.toString(),
      sponsorAddress: created.sponsor,
      fundTxHash: txHash,
      rewardToken: token.symbol,
      deadline: new Date(Number(created.deadline) * 1000),
      // A schedule keeps what its winners are paid as the reward; an older bounty has only the deposit.
      ...(scheduled ? {} : { rewardAmount: amount, reward: `${formatAmount(amount)} ${token.symbol}` }),
    });
    const saved = await this.bountyRepository.save(entity);
    // A funded bounty is open, which is when it appears on the bounties page and in search.
    this.eventEmitter.emit(SEARCH_INDEX_STALE_EVENT);
    return Bounty.fromEntity(saved);
  }

  // Brings a funded bounty in line with its escrow: who was paid, and whether
  // it is closed. Everything is read from the chain, so anyone signed in may
  // ask for it, whoever sent the award.
  async syncEscrow(slug: string): Promise<Bounty> {
    const entity = await this.bountyRepository.findOneBy({ slug });
    if (!entity || entity.status === 'draft') throw new NotFoundException('Bounty not found');
    if (!entity.chainId || !entity.onchainId) return Bounty.fromEntity(entity);

    const { chainId } = entity;
    const escrow = escrowAddressFor(chainId);
    if (!escrow) throw new BadRequestException('There is no escrow on this network');
    const client = this.clientFor(chainId);
    const id = BigInt(entity.onchainId);

    const read = async () => {
      const fromBlock = entity.fundTxHash
        ? (await client.getTransactionReceipt({ hash: entity.fundTxHash as Hash })).blockNumber
        : 'earliest';
      return Promise.all([
        // authorizationList is only there for the types: with a client built for
        // any of several chains they ask for it.
        client.readContract({ address: escrow, abi: bountyEscrowAbi, functionName: 'getBounty', args: [id], authorizationList: undefined }),
        client.getContractEvents({ address: escrow, abi: bountyEscrowAbi, eventName: 'Awarded', args: { id }, fromBlock }),
      ]);
    };
    const [onchain, awards] = await read().catch(() => {
      throw new BadRequestException('Could not read the escrow. Try again in a moment.');
    });

    const paidEvents = awards.flatMap(({ args, blockNumber }) =>
      args.winner && args.amount !== undefined && args.fee !== undefined
        ? [{ winner: args.winner, amount: args.amount, fee: args.fee, blockNumber }]
        : [],
    );

    if (paidEvents.length > 0) {
      const token = escrowTokens[chainId]?.find(t => t.address.toLowerCase() === onchain.token.toLowerCase());
      const entries = await this.entryRepository.find({
        where: { bountySlug: slug, submittedAt: Not(IsNull()), wallet: Not(IsNull()) },
        relations: ENTRY_RELATIONS,
      });
      const entryByWallet: EntryByWallet = new Map(
        entries.map(entry => [
          entry.wallet!.toLowerCase(),
          { author: authorName(entry.author), notebookSlug: notebookSlug(entry.document) ?? '' },
        ]),
      );

      // When each payment was made, to tell one made before the deadline. A block that cannot be
      // read leaves that payment without a time rather than failing the sync.
      const blockTimes = new Map<bigint, number | null>();
      await Promise.all(
        [...new Set(paidEvents.map(event => event.blockNumber))].map(async blockNumber => {
          const time = await client.getBlock({ blockNumber }).then(block => Number(block.timestamp)).catch(() => null);
          blockTimes.set(blockNumber, time);
        }),
      );

      const awardList: PaidEvent[] = paidEvents.map(event => ({
        winner: event.winner,
        amount: event.amount,
        fee: event.fee,
        paidAt: blockTimes.get(event.blockNumber) ?? null,
      }));
      entity.winners = buildWinners({
        awards: awardList,
        tiers: token ? (entity.prizeTiers ?? []).map(tier => parseUnits(tier.amount, token.decimals)) : [],
        feeBps: Number(onchain.feeBps),
        deadline: Number(onchain.deadline),
        entries: entryByWallet,
        token,
      });
    }
    if (onchain.closed) entity.status = 'closed';

    const saved = await this.bountyRepository.save(entity);
    this.eventEmitter.emit(SEARCH_INDEX_STALE_EVENT);
    return Bounty.fromEntity(saved);
  }
}
