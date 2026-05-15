import { InputType, Field } from '@nestjs/graphql';
import { StringField, StringFieldOptional, UUIDField, BooleanField, BooleanFieldOptional } from '@sandworm/graphql';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


@InputType()
export class FocusedBlockInput {
  @UUIDField()
  id!: string;

  @StringField()
  title!: string;

  @StringField()
  type!: string;
}


@InputType()
export class CreateChatInput {
  @UUIDField()
  workspaceId!: string;

  @UUIDField()
  documentId!: string;

  @StringField({ minLength: 1, maxLength: 2000 })
  message!: string;

  @StringField()
  model!: string;

  @StringFieldOptional({ description: 'Optional custom title. Auto-generated from message if not provided.' })
  title?: string;

  @Field(() => [FocusedBlockInput], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FocusedBlockInput)
  focusedBlocks?: FocusedBlockInput[];

  @BooleanFieldOptional({ description: 'Whether to update the document title from the chat message. Defaults to false.' })
  updateDocumentTitle?: boolean;

}

@InputType()
export class UpdateChatInput {
  @UUIDField()
  chatId!: string;

  @StringFieldOptional({ minLength: 1, maxLength: 255 })
  title?: string;
}

@InputType()
export class SendMessageInput {
  @UUIDField()
  chatId!: string;

  @StringField({ minLength: 1, maxLength: 4000 })
  content!: string;

  @StringField()
  model!: string;

  @Field(() => [FocusedBlockInput], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FocusedBlockInput)
  focusedBlocks?: FocusedBlockInput[];
}

@InputType()
export class EditMessageInput {
  @UUIDField()
  messageId!: string;

  @UUIDField()
  chatId!: string;

  @StringField({ minLength: 1, maxLength: 4000 })
  content!: string;
}

@InputType()
export class VoteMessageInput {
  @UUIDField()
  messageId!: string;

  @BooleanField()
  isUpvoted!: boolean;
}