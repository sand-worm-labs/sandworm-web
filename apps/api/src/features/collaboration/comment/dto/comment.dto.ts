import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsUUID, MinLength } from 'class-validator';
import { UUIDField, StringField } from '@sandworm/graphql';

@InputType()
export class CreateCommentInput {
  @UUIDField()
  @IsUUID()
  id: string;

  @StringField()
  @IsString()
  @MinLength(1)
  body: string;
}

@InputType()
export class UpdateCommentInput {
  @StringField({ nullable: false })
  @IsString()
  @MinLength(1)
  body?: string;
}

@InputType()
export class DeleteCommentInput {
  @UUIDField()
  @IsUUID()
  workspaceId: string;

  @UUIDField()
  @IsUUID()
  documentId: string;

  @UUIDField()
  @IsUUID()
  commentId: string;
}