import { ObjectType } from '@nestjs/graphql';
import { DateField, StringField, UUIDField } from '@sandworm/graphql';
import { CommentEntity } from '@sandworm/postgresql-typeorm';

@ObjectType()
export class Comment {
  @UUIDField()
  id!: string;

  @StringField()
  body!: string;

  @UUIDField()
  documentId!: string;

  @UUIDField()
  authorId!: string;

  @DateField()
  createdAt!: Date;

  @DateField()
  updatedAt!: Date;

  static fromEntity(entity: CommentEntity): Comment {
    const comment = new Comment();
    comment.id = entity.id;
    comment.body = entity.body;
    comment.documentId = entity.documentId;
    comment.authorId = entity.authorId;
    comment.createdAt = entity.createdAt;
    comment.updatedAt = entity.updatedAt;
    return comment;
  }

  static fromEntities(entities: CommentEntity[]): Comment[] {
    return entities.map((entity) => Comment.fromEntity(entity));
  }
}