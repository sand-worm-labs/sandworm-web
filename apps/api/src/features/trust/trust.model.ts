import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BooleanField, DateField, StringField, StringFieldOptional } from '@sandworm/graphql';
import type { NotebookAttestationEntity } from '@sandworm/postgresql-typeorm';

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
    return attestation;
  }
}

// Whether a notebook can be submitted to a bounty right now, and if not, why.
@ObjectType()
export class NotebookTrust {
  @BooleanField()
  trusted!: boolean;

  @StringFieldOptional()
  reason?: string | null;

  @Field(() => NotebookAttestation, { nullable: true })
  attestation?: NotebookAttestation | null;
}
