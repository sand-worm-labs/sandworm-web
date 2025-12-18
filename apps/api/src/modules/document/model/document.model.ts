import { ObjectType } from '@nestjs/graphql';
import {
  BooleanField,
  StringField,
  UUIDField,
  NumberField,
  DateField,
  DateFieldOptional,
  UUIDFieldOptional,
} from '@sandworm/graphql';
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

  @UUIDFieldOptional()
  parentId!: string | null;

  @BooleanField()
  runUnexecutedBlocks!: boolean;

  @BooleanField()
  runSQLSelection!: boolean;

  @BooleanField()
  shareLinksWithoutSidebar!: boolean;

  @StringField()
  icon!: string;

  @NumberField()
  orderIndex!: number;

  @DateFieldOptional()
  deletedAt!: Date | null;

  @DateField()
  createdAt!: Date;

  @DateField()
  updatedAt!: Date;

  @NumberField()
  version!: number;

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
    document.orderIndex = entity.orderIndex;
    document.deletedAt = entity.deletedAt;
    document.createdAt = entity.createdAt;
    document.updatedAt = entity.updatedAt;
    document.version = entity.version;
    return document;
  }

  static fromEntities(entities: DocumentEntity[]): Document[] {
    return entities.map((entity) => Document.fromEntity(entity));
  }
}