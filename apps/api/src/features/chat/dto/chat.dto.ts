import { InputType } from '@nestjs/graphql';
import { StringField, StringFieldOptional, UUIDField, UUIDFieldOptional } from '@sandworm/graphql';

@InputType()
export class CreateChatInput {
  @UUIDField()
  workspaceId!: string;

  @UUIDField()
  documentId!: string;

  @StringField({ minLength: 1, maxLength: 2000 })
  message!: string;

  @StringFieldOptional({ description: 'Optional custom title. Auto-generated from message if not provided.' })
  title?: string;
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

  @UUIDFieldOptional()
  blockId?: string;

  @StringField()
  model: string;
}

@InputType()
export class EditMessageInput {
  @UUIDField()
  messageId: string;

  @UUIDField()
  chatId: string;

  @StringField({ minLength: 1, maxLength: 4000 })
  content: string;
}