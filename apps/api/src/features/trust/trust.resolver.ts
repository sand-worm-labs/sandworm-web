import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { NotebookAttestation, NotebookTrust } from './trust.model';
import { TrustService } from './trust.service';

@Resolver(() => NotebookAttestation)
export class TrustResolver {
  constructor(private readonly trust: TrustService) {}

  @Mutation(() => NotebookTrust, {
    name: 'attestNotebook',
    description:
      "Start committing a cloud notebook's inputs (its code, data sources, parameters and when it ran) onchain, with a validator re-checking them. Returns at once with pending set: follow it with getNotebookTrust. Run the notebook first. Bounties accept only attested notebooks.",
  })
  async attestNotebook(
    @CurrentUser('id') userId: string,
    @Args('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Args('documentId', new ParseUUIDPipe()) documentId: string,
  ): Promise<NotebookTrust> {
    const ref = { userId, workspaceId, documentId };
    await this.trust.start(ref);
    return NotebookTrust.fromStatus(await this.trust.status(ref));
  }

  @Query(() => NotebookAttestation, {
    name: 'getNotebookAttestation',
    nullable: true,
    description: "The latest attestation of a notebook, or null if it has none.",
  })
  async getNotebookAttestation(
    @Args('documentId', new ParseUUIDPipe()) documentId: string,
  ): Promise<NotebookAttestation | null> {
    const row = await this.trust.latest(documentId);
    return row ? NotebookAttestation.fromEntity(row) : null;
  }

  @Query(() => NotebookTrust, {
    name: 'getNotebookTrust',
    description: 'Whether a notebook is trusted right now (attested, and unchanged since), and if not, why.',
  })
  async getNotebookTrust(
    @CurrentUser('id') userId: string,
    @Args('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Args('documentId', new ParseUUIDPipe()) documentId: string,
  ): Promise<NotebookTrust> {
    return NotebookTrust.fromStatus(await this.trust.status({ userId, workspaceId, documentId }));
  }
}
