import { InputType } from '@nestjs/graphql';
import {
  BooleanFieldOptional,
  NumberField,
  StringFieldOptional,
  UUIDField,
  UUIDFieldOptional,
} from '@sandworm/graphql';

@InputType()
export class CreateDocumentInput {
  @StringFieldOptional()
  title: string;

  @UUIDFieldOptional()
  parentId?: string;

  @NumberField()
  version: number;

  @NumberField({ defaultValue: 0 })
  orderIndex: number;
}

@InputType()
export class UpdateDocumentInput {
  @StringFieldOptional()
  title?: string;

  @UUIDFieldOptional()
  parentId?: string | null;

  @NumberField()
  orderIndex: number;

  @BooleanFieldOptional()
  runUnexecutedBlocks?: boolean;

  @BooleanFieldOptional()
  runSQLSelection?: boolean;

  @BooleanFieldOptional()
  shareLinksWithoutSidebar?: boolean;
}

@InputType()
export class DeleteDocumentInput {
  @UUIDField()
  workspaceId: string;

  @UUIDField()
  documentId: string;

  @BooleanFieldOptional()
  isPermanent?: boolean;
}

@InputType()
export class RestoreDocumentInput {
  @UUIDField()
  workspaceId: string;

  @UUIDField()
  documentId: string;
}

@InputType()
export class DuplicateDocumentInput {
  @UUIDField()
  workspaceId: string;

  @UUIDField()
  documentId: string;
}

@InputType()
export class FavoriteDocumentInput {
  @UUIDField({nullable: true})
  workspaceId?: string;

  @UUIDField()
  documentId: string;
}

@InputType()
export class FavoritePublicDocumentInput {
  @UUIDField()
  documentId: string;
}


@InputType()
export class ForkDocumentInput {
  @UUIDField()
  documentId!: string;

  @UUIDField()
  targetWorkspaceId!: string;
}