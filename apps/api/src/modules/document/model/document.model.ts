import { ObjectType } from '@nestjs/graphql';
import { BooleanField, StringField, UUIDField } from '@sandworm/graphql';
import { DocumentEntity } from '@sandworm/postgresql-typeorm';

@ObjectType()
export class Document {
  @UUIDField()
  id!: string;

  @StringField()
  slug!: string;

  @StringField()
  title!: string;

  @UUIDField()
  authorId!: string;

  @UUIDField()
  workspaceId!: string;

  @UUIDField()
  parentId!: string;

  @BooleanField()
  runUnexecutedBlocks!: boolean;

  @BooleanField()
  runSQLSelection!: boolean;

  @BooleanField()
  shareLinksWithoutSidebar!: boolean;

  static fromEntity(entity: DocumentEntity): Document {
    const document = new Document();
    document.id = entity.id;
    document.slug = entity.slug;
    document.title = entity.title;
    document.authorId = entity.authorId;
    document.workspaceId = entity.workspaceId;
    document.parentId = entity.parentId;
    document.runUnexecutedBlocks = entity.runUnexecutedBlocks;
    document.runSQLSelection = entity.runSQLSelection;
    document.shareLinksWithoutSidebar = entity.shareLinksWithoutSidebar;
    return document;
  }

  static fromEntities(entities: DocumentEntity[]): Document[] {
    return entities.map((entity) => Document.fromEntity(entity));
  }
}