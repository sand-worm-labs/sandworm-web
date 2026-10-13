import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { SEARCH_INDEX_STALE_EVENT } from '@/features/search/search.events';
import { BountyEntity, BountyEntryEntity, type BountyWinner } from '@sandworm/postgresql-typeorm';
import { bountyEscrowAbi, bountyRef, escrowAddressFor, escrowTokens } from '@sandworm/types/escrow';
import { IsNull, Not, Repository } from 'typeorm';
import { createPublicClient, formatUnits, http, parseEventLogs, type Chain, type Hash } from 'viem';
import {  monad, monadTestnet } from 'viem/chains';
import { formatAmount, ordinal, shortAddress } from './bounty.format';
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

    // A wallet awarded more than once is one winner, with the sum.
    const paid = new Map<string, bigint>();
    awards.forEach(({ args }) => {
      if (!args.winner || args.amount === undefined) return;
      paid.set(args.winner, (paid.get(args.winner) ?? 0n) + args.amount);
    });

    if (paid.size > 0) {
      const entries = await this.entryRepository.find({
        where: { bountySlug: slug, submittedAt: Not(IsNull()), wallet: Not(IsNull()) },
        relations: ENTRY_RELATIONS,
      });
      const entryByWallet = new Map(entries.map(entry => [entry.wallet!.toLowerCase(), entry]));
      const token = escrowTokens[chainId]?.find(t => t.address.toLowerCase() === onchain.token.toLowerCase());

      entity.winners = [...paid.entries()]
        .sort(([, a], [, b]) => (a < b ? 1 : a > b ? -1 : 0))
        .map(([address, amount], index): BountyWinner => {
          const entry = entryByWallet.get(address.toLowerCase());
          return {
            place: ordinal(index + 1),
            author: entry ? authorName(entry.author) : shortAddress(address),
            notebookSlug: notebookSlug(entry?.document) ?? '',
            amount: token ? `${formatAmount(formatUnits(amount, token.decimals))} ${token.symbol}` : null,
            address,
          };
        });
    }
    if (onchain.closed) entity.status = 'closed';

    const saved = await this.bountyRepository.save(entity);
    this.eventEmitter.emit(SEARCH_INDEX_STALE_EVENT);
    return Bounty.fromEntity(saved);
  }
}
