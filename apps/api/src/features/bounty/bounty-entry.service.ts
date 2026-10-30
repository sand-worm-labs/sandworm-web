import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BountyEntity, BountyEntryEntity, DocumentEntity, DocumentVisibility } from '@sandworm/postgresql-typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { getAddress, isAddress } from 'viem';
import { bountiesRequireTrust, TRUST_GATE, type TrustGate } from '../trust/trust.gate';
import { BountyEntry, bountyStatus, ENTRY_RELATIONS } from './bounty.model';

@Injectable()
export class BountyEntryService {
  constructor(
    @InjectRepository(BountyEntryEntity)
    private readonly entryRepository: Repository<BountyEntryEntity>,
    @InjectRepository(BountyEntity)
    private readonly bountyRepository: Repository<BountyEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @Inject(TRUST_GATE) private readonly trust: TrustGate,
  ) { }

  // The submitted entries, oldest first. Everyone can read them: an entry is a
  // published notebook. Wallets go only to the bounty's creator, who pays, and
  // to each entry's own author.
  async getEntries(slug: string, userId?: string): Promise<BountyEntry[]> {
    const bounty = await this.bountyRepository.findOneBy({ slug });
    if (!bounty || (bounty.status === 'draft' && bounty.creatorId !== userId)) return [];

    const entries = await this.entryRepository.find({
      where: { bountySlug: slug, submittedAt: Not(IsNull()) },
      relations: ENTRY_RELATIONS,
      order: { submittedAt: 'ASC' },
    });
    const seesWallets = !!userId && bounty.creatorId === userId;
    return entries
      .filter(entry => entry.document?.publishedAt && entry.document.visibility === DocumentVisibility.PUBLIC && !entry.document.deletedAt)
      .map(entry => BountyEntry.fromEntity(entry, { userId, seesWallets }));
  }

  // Every bounty the user has started or submitted, so the pages know which
  // notebook is theirs on any device.
  async getMyEntries(userId: string): Promise<BountyEntry[]> {
    const entries = await this.entryRepository.find({
      where: { authorId: userId },
      relations: ENTRY_RELATIONS,
      order: { createdAt: 'DESC' },
    });
    return entries
      .filter(entry => entry.document && !entry.document.deletedAt)
      .map(entry => BountyEntry.fromEntity(entry, { userId, seesWallets: false }));
  }

  async startEntry(slug: string, documentId: string, userId: string): Promise<BountyEntry> {
    await this.openBounty(slug);
    await this.ownDocument(documentId, userId);

    const existing = await this.entryRepository.findOneBy({ bountySlug: slug, authorId: userId });
    if (existing?.submittedAt) throw new BadRequestException('You have already submitted an entry for this bounty');

    const entry = existing ?? this.entryRepository.create({ bountySlug: slug, authorId: userId, wallet: null, submittedAt: null });
    entry.documentId = documentId;
    return this.saved(entry, userId);
  }

  // The notebook has to be published already: publishing is what makes it
  // readable by the sponsor, and it has to be trusted: attested onchain, with
  // nothing changed since, so every entry is one that can be re-run as submitted.
  async submitEntry(slug: string, documentId: string, wallet: string | undefined, userId: string): Promise<BountyEntry> {
    const bounty = await this.openBounty(slug);
    const document = await this.ownDocument(documentId, userId);
    if (!document.publishedAt) throw new BadRequestException('Publish the notebook before submitting it');
    // An entry's notebook is linked from a public page, so an unlisted notebook (shared by a secret link) cannot be one.
    if (document.visibility !== DocumentVisibility.PUBLIC) {
      throw new BadRequestException('Publish the notebook publicly before submitting it: an unlisted link would be shown on the bounty page');
    }

    const address = wallet?.trim();
    if (address && !isAddress(address)) throw new BadRequestException('The wallet address is not valid');
    // A funded bounty pays from escrow to an address, so it needs one.
    if (bounty.onchainId && !address) throw new BadRequestException('Add the wallet the reward should be paid to');

    const attestation = bountiesRequireTrust()
      ? await this.trust.trusted({ userId, workspaceId: document.workspaceId, documentId })
      : null;

    const existing = await this.entryRepository.findOneBy({ bountySlug: slug, authorId: userId });
    const entry = existing ?? this.entryRepository.create({ bountySlug: slug, authorId: userId });
    entry.documentId = documentId;
    entry.attestationId = attestation?.id ?? null;
    entry.wallet = address ? getAddress(address) : null;
    entry.submittedAt = existing?.submittedAt ?? new Date();
    return this.saved(entry, userId);
  }

  private async saved(entry: BountyEntryEntity, userId: string): Promise<BountyEntry> {
    const { id } = await this.entryRepository.save(entry);
    const full = await this.entryRepository.findOneOrFail({ where: { id }, relations: ENTRY_RELATIONS });
    return BountyEntry.fromEntity(full, { userId, seesWallets: false });
  }

  private async openBounty(slug: string): Promise<BountyEntity> {
    const bounty = await this.bountyRepository.findOneBy({ slug });
    if (!bounty || bounty.status === 'draft') throw new NotFoundException('Bounty not found');
    if (bountyStatus(bounty) !== 'open') throw new BadRequestException('This bounty is no longer taking entries');
    return bounty;
  }

  private async ownDocument(documentId: string, userId: string): Promise<DocumentEntity> {
    const document = await this.documentRepository.findOneBy({ id: documentId });
    if (!document || document.deletedAt || document.authorId !== userId) throw new NotFoundException('Notebook not found');
    return document;
  }
}
