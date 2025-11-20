import { InputType } from '@nestjs/graphql';
import {
  StringFieldOptional,
  NumberField,
  NumberFieldOptional,
  UUIDField,
  UUIDFieldOptional,
  BooleanFieldOptional,
} from '@sandworm/graphql';

@InputType()
export class CreateDocumentInput {
  @StringFieldOptional()
  title: string;

  @StringFieldOptional()
  icon?: string;

  @UUIDFieldOptional()
  parentId?: string;
}

@InputType()
export class DocumentRelationsInput {
  @UUIDFieldOptional()
  parentId?: string | null;

  @NumberField()
  orderIndex: number;
}

@InputType()
export class UpdateDocumentInput {
  @StringFieldOptional()
  title?: string;
  relations?: DocumentRelationsInput;
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
