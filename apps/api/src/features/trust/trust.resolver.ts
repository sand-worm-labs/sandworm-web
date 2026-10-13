import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { NotebookAttestation, NotebookTrust } from './trust.model';
import { TrustService } from './trust.service';

@Resolver(() => NotebookAttestation)
export class TrustResolver {
  constructor(private readonly trust: TrustService) {}

  @Mutation(() => NotebookAttestation, {
    name: 'attestNotebook',
    description:
      'Commit to a cloud notebook\'s inputs (its code, data sources, parameters and when it ran) onchain, and have a validator re-check them. Run the notebook first. Bounties accept only attested notebooks.',
  })
  async attestNotebook(
    @CurrentUser('id') userId: string,
    @Args('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Args('documentId', new ParseUUIDPipe()) documentId: string,
  ): Promise<NotebookAttestation> {
    return NotebookAttestation.fromEntity(await this.trust.attest({ userId, workspaceId, documentId }));
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
    const { trusted, reason, attestation } = await this.trust.status({ userId, workspaceId, documentId });
    return { trusted, reason: reason ?? null, attestation: attestation ? NotebookAttestation.fromEntity(attestation) : null };
  }
}
