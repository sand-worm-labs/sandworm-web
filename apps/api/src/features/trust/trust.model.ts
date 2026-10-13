import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BooleanField, DateField, StringField, StringFieldOptional } from '@sandworm/graphql';
import type { NotebookAttestationEntity } from '@sandworm/postgresql-typeorm';
import { agentLink, receiptLink, txLink } from './trust.links';

// What a notebook's attestation shows: who made it, what it commits to, and the
// transactions anyone can open on the explorer.
@ObjectType()
export class NotebookAttestation {
  @StringField()
  id!: string;

  @StringField()
  documentId!: string;

  @StringField()
  agentId!: string;

  @StringField()
  requestHash!: string;

  @StringField()
  receiptUri!: string;

  @StringField()
  codeHash!: string;

  @StringField()
  inputHash!: string;

  @DateField()
  ranAt!: Date;

  @StringField()
  validator!: string;

  // 100 when every check passed, 0 when one did not
  @Field(() => Int, { nullable: true })
  response?: number | null;

  @StringField()
  requestTx!: string;

  @StringFieldOptional()
  responseTx?: string | null;

  @DateField()
  createdAt!: Date;

  // Links to look at it: the agent, the request and the verdict on the explorer, and the receipt itself
  @StringField()
  agentUrl!: string;

  @StringField()
  requestTxUrl!: string;

  @StringFieldOptional()
  responseTxUrl?: string | null;

  @StringFieldOptional()
  receiptUrl?: string | null;

  static fromEntity(entity: NotebookAttestationEntity): NotebookAttestation {
    const attestation = new NotebookAttestation();
    attestation.id = entity.id;
    attestation.documentId = entity.documentId;
    attestation.agentId = entity.agentId;
    attestation.requestHash = entity.requestHash;
    attestation.receiptUri = entity.receiptUri;
    attestation.codeHash = entity.codeHash;
    attestation.inputHash = entity.inputHash;
    attestation.ranAt = entity.ranAt;
    attestation.validator = entity.validator;
    attestation.response = entity.response;
    attestation.requestTx = entity.requestTx;
    attestation.responseTx = entity.responseTx;
    attestation.createdAt = entity.createdAt;
    attestation.agentUrl = agentLink(entity.agentId);
    attestation.requestTxUrl = txLink(entity.requestTx);
    attestation.responseTxUrl = entity.responseTx ? txLink(entity.responseTx) : null;
    attestation.receiptUrl = receiptLink(entity.receiptUri);
    return attestation;
  }
}

// Whether a notebook can be submitted to a bounty right now, and if not, why.
@ObjectType()
export class NotebookTrust {
  @BooleanField()
  trusted!: boolean;

  // An attestation is being made: it re-runs the notebook and writes to the chain, so it takes a while
  @BooleanField()
  pending!: boolean;

  @StringFieldOptional()
  reason?: string | null;

  @Field(() => NotebookAttestation, { nullable: true })
  attestation?: NotebookAttestation | null;

  static fromStatus(status: {
    trusted: boolean;
    pending: boolean;
    reason?: string;
    attestation?: NotebookAttestationEntity;
  }): NotebookTrust {
    const trust = new NotebookTrust();
    trust.trusted = status.trusted;
    trust.pending = status.pending;
    trust.reason = status.reason ?? null;
    trust.attestation = status.attestation ? NotebookAttestation.fromEntity(status.attestation) : null;
    return trust;
  }
}
