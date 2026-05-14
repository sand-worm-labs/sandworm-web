import { ObjectType } from '@nestjs/graphql';
import { BooleanField, DateField, UUIDField } from '@sandworm/graphql';
import { VoteEntity } from '@sandworm/postgresql-typeorm';

@ObjectType()
export class Vote {
  @UUIDField()
  userId!: string;

  @UUIDField()
  messageId!: string;

  @BooleanField()
  isUpvoted!: boolean;

  @DateField()
  createdAt!: Date;

  @DateField()
  updatedAt!: Date;

  static fromEntity(entity: VoteEntity): Vote {
    const vote = new Vote();
    vote.userId = entity.userId;
    vote.messageId = entity.messageId;
    vote.isUpvoted = entity.isUpvoted;
    vote.createdAt = entity.createdAt;
    vote.updatedAt = entity.updatedAt;
    return vote;
  }

  static fromEntities(entities: VoteEntity[]): Vote[] {
    return entities.map((e) => Vote.fromEntity(e));
  }
}