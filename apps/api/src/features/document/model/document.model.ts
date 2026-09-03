import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  BooleanField,
  StringField,
  StringFieldOptional,
  UUIDField,
  NumberField,
  DateField,
  DateFieldOptional,
  UUIDFieldOptional,
} from '@sandworm/graphql';
import { DocumentEntity, DocumentVisibility } from '@sandworm/postgresql-typeorm';
import { GraphQLJSON } from 'graphql-type-json';

registerEnumType(DocumentVisibility, { name: 'DocumentVisibility' });

@ObjectType()
export class Document {
  @UUIDField()
  id!: string;

  @StringFieldOptional()
  slug!: string | null;

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

  @StringFieldOptional()
  icon!: string | null;

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

  // Publish feature fields
  @DateFieldOptional()
  publishedAt!: Date | null;

  @Field(() => DocumentVisibility)
  visibility: DocumentVisibility = DocumentVisibility.WORKSPACE;

  @BooleanField({ defaultValue: false })
  isDataApp: boolean = false;

  @BooleanField({ defaultValue: true })
  isSyncedWithYjs: boolean = true;

  @BooleanField({ defaultValue: false })
  hasDashboard: boolean = false;

  @StringField({ defaultValue: '' })
  appId: string = '';

  @NumberField({ defaultValue: 0 })
  clock: number = 0;

  @NumberField({ defaultValue: 0 })
  appClock: number = 0;

  @Field(() => GraphQLJSON, { defaultValue: {} })
  userAppClock: Record<string, number> = {};

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
    document.icon = null;

    // Publish feature defaults
    document.publishedAt = (entity as any).publishedAt ?? null;
    document.visibility = (entity as any).visibility ?? DocumentVisibility.WORKSPACE;
    document.isDataApp = (entity as any).isDataApp ?? false;
    document.isSyncedWithYjs = true;
    document.hasDashboard = false;
    document.appId = '';
    document.clock = 0;
    document.appClock = 0;
    document.userAppClock = {};

    return document;
  }

  static fromEntities(entities: DocumentEntity[]): Document[] {
    return entities.map((entity) => Document.fromEntity(entity));
  }
}